# rXplorer
## Visualizing the relationship between pharmaceutical company payments and drug prescriptions

Final project  
[MIDS W209 Data Visualization and Communication](http://www.ischool.berkeley.edu/courses/datasci209)
[UC-Berkeley School of Information](http://www.ischool.berkeley.edu/)

* Michael Marks
* Natarajan Krishnaswami
* Stephane Truong

# Status
## Open issues
* integrate Physician Selector and Table Lens
* add margin to Physician Selector
* add filters on payment & rx count thresholds
* add button to call `physician.marker_cb` from marker popup

## Fixed issues
* fix warning highlight
* markers don't get added
* add zip code yellow marker `Icon`  
  http://leafletjs.com/reference.html#icon

## Pending Enhancements
### Physician Selector
* clean up filters
  * lots of name filters; hide some by default?
  * search box to filter specialties
* choropleth with 2d color scheme (like wild pollinators map)
* better visual integration of map
* more scrolling/transitions

### Table Lens:
* include drug descriptions in table lens
* opt. limit histogram comparison universe (to search results)

# Acknlowledgements
## Data provenance
* Medicare Part D Prescriber PUF
* CMS Open Payments data
* GeoNames Postal Code dataset.
* Census geocoder batch geocoding API

## Tools
* d3.js for table lens charts and scatter strip histogram
* plotly.js for alt. table lens testing
* DataTables for search results display
* leaflet.js for map display/interaction
* jQuery for DOM maninpulation
* oboe.js for low latency json processing
* python/flask for web service interface
* MariaDB for data storage and indexing
* ipython-sql for data exploration

# Limitations
* Medicare Part D data will presumably primarily reflect 65+ pop's rx needs.
* Join quality is very difficult to achieve; do not draw conclusions without corroboration!
