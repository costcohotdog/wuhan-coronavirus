from flask import Flask, jsonify, render_template, redirect, current_app
from pymongo import MongoClient
from flask_cors import CORS
from bson.json_util import dumps
import article_scraper

app = Flask(__name__)
CORS(app)
username = 'read_only'
password = 'rJMef22QkRqPDFzk'
client = MongoClient("mongodb+srv://" + username + ":" + password + "@cluster0-paegd.mongodb.net/test?retryWrites=true&w=majority")
db = client.corona_virus

cases_collection = db['cases']
cases = [case for case in cases_collection.find()]

date_collection = db['cases_by_date']
data = [date for date in date_collection.find()]

sars_collection = db['sars']
data = [day for day in sars_collection.find()]

news_feed = article_scraper.scrape()

@app.route('/', methods=['GET'])
def home():
    return render_template('index.html', data=cases)

@app.route('/api/sars',methods=['GET'])
def api_sars():
    sars_list = list(sars_collection.find())
    return current_app.response_class(dumps(sars_list), mimetype="application/json")

@app.route('/api/cases',methods=['GET'])
def api_case():
    case_list = list(cases_collection.find())
    return current_app.response_class(dumps(case_list), mimetype="application/json")

@app.route('/api/cases/<location>',methods=['GET'])
def api_case_location(location):
    case_list = list(cases_collection.find({'location': location}))
    return current_app.response_class(dumps(case_list), mimetype="application/json")

@app.route('/api/date', methods=['GET'])
def api_latest_data():
    date_list = list(date_collection.find().sort('date'))
    return current_app.response_class(dumps(date_list), mimetype="application/json")

@app.route('/api/timeline', methods=['GET'])
def api_time_line():
    timeline = news_feed
    return current_app.response_class(dumps(timeline), mimetype="application/json")

if __name__ == '__main__':
    app.run(debug=True)
