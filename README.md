# Wuhan Coronavirus COVID-19 Tracker
View the app [HERE](https://covid2019-tracker.appspot.com/)

<img src="https://github.com/L0per/wuhan-coronavirus/blob/master/static/images/header-preview.PNG?raw=true" alt="stream-chart" width="500"/>

## About
We aimed to create a web app that told the living-story of the COVID-19 outbreak with beautiful and informative visuals. The site updates on a daily basis and we hope to maintain the living-story of the site as the situation progresses. Here's one of our charts showing the total number of confirmed cases in countries outside of China over time:

<img src="https://github.com/L0per/wuhan-coronavirus/blob/master/static/images/steamchart.PNG?raw=true" alt="stream-chart" width="800"/>

## Data
* Johns Hopkins CSSE Github repo: https://github.com/CSSEGISandData/COVID-19
* The data is transformed and loaded onto a cloud MongoDB server.
* We serve the data through a RESTless Flask API.
* Once the John Hopkins repo is cloned, the ETL process is automated by running `automated_ETL.py` (paths need to be modified).

## Comments
Please let us know if you have feedback on improving our design and code, thanks!
