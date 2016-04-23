#!/usr/bin/env python
from flask import Flask, Response, request, send_from_directory
from flask.ext.compress import Compress
from flask.ext.cors import CORS

import ujson as json
import sqlalchemy
import numpy as np

app=Flask('w209dbapi')
Compress(app)
CORS(app)
engine = sqlalchemy.create_engine('mysql://reader@localhost/final', echo=True)

@app.route('/')
def root():
        return Response(
            ["Go away"],
            mimetype='text/plain')

@app.route('/robots.txt')
def robots():
        return Response(
            ["User-agent: *\n Disallow: /\n"],
            mimetype='text/plain')

@app.route('/favicon.ico')
def favicon():
        return send_from_directory(
            '../images',
            'favicon.png',
            mimetype='image/png')


def generateDict(query):
    err=''
    yield '{"data": ['
    try:
        cursor=engine.execute(query)
        pfx=''
        while True:
            rows=cursor.fetchmany()
            if not rows:
                break
            for row in rows:
                yield  pfx+json.dumps(dict(row.items()))
                if not pfx:
                    pfx=','
    except Exception,e:
        err=',"error":' + json.dumps(str(e))
    finally:
        yield ']'+err+'}\n'

def generateArray(query):
    err=''
    yield '{'
    try:
        cursor=engine.execute(query)
        yield '"keys":{keys},"data": ['.format(keys=json.dumps(cursor.keys()))
        try:
            pfx=''
            while True:
                rows=cursor.fetchmany()
                if not rows:
                    break
                for row in rows:
                    vals=[]
                    for key in cursor.keys():
                        if row.has_key(key):
                            vals.append(row[key])
                        else:
                            vals.append(None)
                    yield  pfx+json.dumps(vals)
                    if not pfx:
                        pfx=','
        finally:
            yield ']'
    except Exception,e:
        err=',"error":' + json.dumps(str(e))
    finally:
        yield err+'}\n'

@app.route('/sql')
def doQuery(query=None, generate=generateDict):
    try:
        if not query:
            query=request.values['query'].strip()
        if not query.endswith(';'):
            query+=';'
        return Response(generate(query), mimetype='application/json')
    except Exception, e:
        return Response(
            [json.dumps({'error': str(e)}), '\n'],
            status='500 Server exception',
            mimetype='application/json')
@app.route('/specialties')
def specialties():
    return doQuery("SELECT Specialty FROM Specialties")

@app.route('/ziploc/<zipcode>')
def ziploc(zipcode, generate=generateDict):
    resp='';
    query="""SELECT CONCAT('{"lat":', ST_Y(loc), ',"lng":', ST_X(loc),'}') AS latlng FROM ZipLoc WHERE """;
    query+='zip={};'.format(zipcode)
    for ext in generate(query):
        resp += ext;
    resp=json.loads(resp)
    if 'err' not in resp or not resp['err']:
        return Response(resp['data'][0]['latlng'], status='200 OK')
    return Response(resp['err'], status='500 Internal Server Error')

@app.route('/mainTable/')
@app.route('/mainTable/<physician>')
def mainTable(physician=None):
    if 'fake' in request.values:
        return send_from_directory('../json', 'Main_Table_Lens_Data.json')
    if physician:
        where='WHERE PhysicianProfileID={physician}'.format(physician=physician)
    else:
        where=''
    return doQuery('''SELECT 
    NameOfAssociatedCoveredDrugOrBiological1      AS Rx,
    NDCOfAssociatedCoveredDrugOrBiological1       AS RxNDC,
    SUM(TotalClaimCountAgg)                       AS RxCnt,
    SUM(NumberOfPaymentsIncludedInTotalAmountAgg) AS PmntCnt,
    SUM(AmountOfPaymentUSDollarsAgg)              AS PmntTot
FROM OpenPaymentPrescrJoin4
{where}
GROUP BY Rx
ORDER BY PmntTot DESC;'''.format(where=where))



@app.route('/hoverTable/<physician>')
def hoverTable(physician):
    if 'real' not in request.values:
        return send_from_directory('../json', 'Hover_Table_Lens_Data.json')
    # todo: fix this!
    return doQuery('''SELECT
  NameOfAssociatedCoveredDrugOrBiological1      AS Rx,
  NatureOfPaymentOrTransferOfValue              AS PmntType,
  SUM(AmountOfPaymentUSDollarsAgg)              AS PmntTot
FROM OpenPaymentPrescrJoin4
WHERE PhysicianProfileID={physician}
GROUP BY Rx,PmntType;'''.format(physician=physician))

@app.route('/histogramData/<column>')
@app.route('/histogramData/<column>/<drug>')
def histogram(column, drug = None):
    if 'fake' in request.values:
        count=np.random.randint(0,10000,1000).tolist()
        return Response(
            json.dumps({'keys':['Count'], 'data': [ [x] for x in count ], 'err': ''}),
            status='200 OK');
    if drug:
        where="""WHERE NameOfAssociatedCoveredDrugOrBiological1='{drug}'""".format(drug=drug)
    else:
        where=''
    return doQuery(
'''SELECT
   SUM(coalesce({column},0)) as Count
FROM OpenPaymentPrescrJoin4
{where}
GROUP BY PhysicianProfileID
ORDER BY Count ASC;'''.format(where=where, column=column), generateArray) 


# Static file paths:
@app.route('/css/<path:path>')
def serveStaticCSS(path):
    return send_from_directory('../css', path)
@app.route('/html/<path:path>')
def serveStaticHTML(path):
    return send_from_directory('../html', path)
@app.route('/images/<path:path>')
def serveStaticImages(path):
    return send_from_directory('../images', path)
@app.route('/js/<path:path>')
def serveStaticJS(path):
    return send_from_directory('../js', path)
@app.route('/rxplorer/<path:path>')
def serveStaticRxPlorer(path):
    return send_from_directory('../rxplorer', path)

if __name__=='__main__':
    engine.connect()
    app.run(host='0.0.0.0', port=20900, debug=True)
