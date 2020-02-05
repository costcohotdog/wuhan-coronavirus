from flask import Flask, jsonify, render_template, redirect, current_app
from pymongo import MongoClient
from bson.json_util import dumps

app = Flask(__name__)
username = 'USERNAME HERE'
password = 'PASSWORD HERE'
client = MongoClient("mongodb+srv://" + username + ":" + password + "@cluster0-paegd.mongodb.net/test?retryWrites=true&w=majority")
db = client.corona_virus

cases_collection = db['cases']
cases = [case for case in cases_collection.find()]


@app.route('/', methods=['GET'])
def home():
    return render_template('index.html', data=cases)


@app.route('/api/cases',methods=['GET'])
def api_rey():
    case_list = list(cases_collection.find())
    return current_app.response_class(dumps(case_list), mimetype="application/json")

@app.route('/api/words/<location>',methods=['GET'])
def api_all_words(date):
    case_list = list(cases_collection.find({'location': location}))
    return current_app.response_class(dumps(case_list), mimetype="application/json")



if __name__ == '__main__':
    app.run(debug=True)
