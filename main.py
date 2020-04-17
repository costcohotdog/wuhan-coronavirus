from flask import Flask, jsonify, render_template, redirect, current_app
from pymongo import MongoClient
from flask_cors import CORS
from bson.json_util import dumps


app = Flask(__name__)
CORS(app)
username = 'read_only'
password = 'rJMef22QkRqPDFzk'
client = MongoClient("mongodb+srv://" + username + ":" + password + "@cluster0-paegd.mongodb.net/test?retryWrites=true&w=majority")
db = client.corona_virus

date_collection = db['daily_cases']
data = [date for date in date_collection.find()]

sars_collection = db['sars']
data = [day for day in sars_collection.find()]


@app.route('/', methods=['GET'])
def home():
    return render_template('index.html', data=cases)

@app.route('/api', methods=['GET'])
def api():
    return render_template('api.html', data=cases)

@app.route('/api/county', methods=['GET'])
def api_county_data():
    query1 = {
    "region": {
    "$regex": 'US',
    "$options" :'i' # case-insensitive
    }
    }
    date_list = list(date_collection.find(query1).sort('date'))
    return current_app.response_class(dumps(date_list), mimetype="application/json")

@app.route('/api/county/<date>', methods=['GET'])
def api_county_date_data():
    query1 = {
    "region": {
    "$regex": 'US',
    "$options" :'i' # case-insensitive
    }
    }
    query2 = {
    "date": date
    }
    date_list = list(date_collection.find({"$and": [query1,query2]}).sort('date'))
    return current_app.response_class(dumps(date_list), mimetype="application/json")

@app.route('/api/global', methods=['GET'])
def api_global_data():
    query1 = {
    "fips": { "$exists": False }
    }
    date_list = list(date_collection.find(query1).sort('date'))
    return current_app.response_class(dumps(date_list), mimetype="application/json")

if __name__ == '__main__':
    app.run(debug=True)
