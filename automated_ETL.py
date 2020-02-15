import git
import pandas as pd
import numpy as np
from datetime import datetime
from dateutil.parser import parse
import pymongo
import dns

path = 'C:/Users/Terra/corona_data'  ### CHANGE THIS TO A DIFFERENT PATH THAN THE CORONAVIRUS REPO
data_folder = 'C:/Users/terra/corona_data/csse_covid_19_data/csse_covid_19_time_series/'  ### CHANGE THIS TO A DIFFERENT PATH THAN THE CORONAVIRUS REPO

g = git.cmd.Git(path)
g.pull()


confirmed_file = data_folder + 'time_series_19-covid-Confirmed.csv'
recovered_file = data_folder + 'time_series_19-covid-Recovered.csv'
deaths_file = data_folder + 'time_series_19-covid-Deaths.csv'


confirmed_df = pd.read_csv(confirmed_file)
recovered_df = pd.read_csv(recovered_file)
deaths_df = pd.read_csv(deaths_file)


confirmed_columns = confirmed_df.columns[4:]
recovered_columns = recovered_df.columns[4:]
deaths_columns = recovered_df.columns[4:]


confirmed_dates = pd.to_datetime(confirmed_columns)
recovered_dates = pd.to_datetime(recovered_columns)
deaths_dates = pd.to_datetime(deaths_columns)

confirmed_dates_formatted = []
recovered_dates_formatted = []
deaths_dates_formatted = []

for x in confirmed_dates:
    confirmed_dates_formatted.append(x.strftime("%m/%d/%Y"))
for x in recovered_dates:
    recovered_dates_formatted.append(x.strftime("%m/%d/%Y"))
for x in deaths_dates:
    deaths_dates_formatted.append(x.strftime("%m/%d/%Y"))

confirmed_dates_formatted = pd.to_datetime(confirmed_dates_formatted)
recovered_dates_formatted = pd.to_datetime(recovered_dates_formatted)
deaths_dates_formatted = pd.to_datetime(deaths_dates_formatted)


username = 'Terra925'
password = 'H%40mmond271'

conn = 'mongodb+srv://' + username +':' + password + '@cluster0-paegd.mongodb.net/test?retryWrites=true&w=majority'
client = pymongo.MongoClient(conn)
db = client['corona_virus']
collection = db['cases_by_date']

cursor = collection.find().sort([('date', -1)]).limit(1)

for x in cursor:
    last_update = x['date']

last_update.strftime("%m/%d/%Y")

i = 0
confirmed_imports = []
for x in confirmed_dates_formatted:
    if x > last_update:
        confirmed_imports.append(confirmed_columns[i])
    i = i + 1

i = 0
recovered_imports = []
for x in recovered_dates_formatted:
    if x > last_update:
        recovered_imports.append(recovered_columns[i])
    i = i + 1

i = 0
deaths_imports = []
for x in deaths_dates_formatted:
    if x > last_update:
        deaths_imports.append(deaths_columns[i])
    i = i + 1

confirmed_imports = confirmed_imports[::-1]
recovered_imports = recovered_imports[::-1]
deaths_imports = deaths_imports[::-1]

z = ''
i = 0
confirmed_imports_filtered = []
for x in confirmed_imports:
    if x[0:6] == z:
        pass
    else:
        confirmed_imports_filtered.append(x)
    z = x[0:6]
    i = i + 1

z = ''
i = 0
recovered_imports_filtered = []
for x in recovered_imports:
    if x[0:6] == z:
        pass
    else:
        recovered_imports_filtered.append(x)
    z = x[0:6]
    i = i + 1

z = ''
i = 0
deaths_imports_filtered = []
for x in deaths_imports:
    if x[0:6] == z:
        pass
    else:
        deaths_imports_filtered.append(x)
    z = x[0:6]
    i = i + 1

confirmed_imports_filtered = confirmed_imports_filtered[::-1] + list(confirmed_df.columns[0:4])
recovered_imports_filtered = recovered_imports_filtered[::-1] + list(recovered_df.columns[0:4])
deaths_imports_filtered = deaths_imports_filtered[::-1] + list(deaths_df.columns[0:4])


confirmed_df = confirmed_df[confirmed_imports_filtered]
recovered_df = recovered_df[recovered_imports_filtered]
deaths_df = deaths_df[deaths_imports_filtered]

confirmed_df.loc[confirmed_df['Province/State'].isnull(),'Province/State'] = confirmed_df['Country/Region']
recovered_df.loc[recovered_df['Province/State'].isnull(),'Province/State'] = recovered_df['Country/Region']
deaths_df.loc[deaths_df['Province/State'].isnull(),'Province/State'] = deaths_df['Country/Region']

confirmed_df = confirmed_df.melt(id_vars=["Province/State", "Country/Region", "Lat", "Long"],
        var_name="Date",
        value_name="Confirmed Cases").sort_values(by=['Province/State', 'Date'])
recovered_df = recovered_df.melt(id_vars=["Province/State", "Country/Region", "Lat", "Long"],
        var_name="Date",
        value_name="Recovered Cases").sort_values(by=['Province/State', 'Date'])
deaths_df = deaths_df.melt(id_vars=["Province/State", "Country/Region", "Lat", "Long"],
        var_name="Date",
        value_name="Death Cases").sort_values(by=['Province/State', 'Date'])


confirmed_df.fillna(0, inplace=True)
recovered_df.fillna(0, inplace=True)
deaths_df.fillna(0, inplace=True)


df = pd.concat([confirmed_df, recovered_df, deaths_df], axis=1)
df = df.iloc[:, [0,1,2,3,4,5,11,17]]

by_date = df.groupby(["Date", "Province/State"]).max().reset_index()
totals = by_date.groupby("Date")["Confirmed Cases", "Recovered Cases", "Death Cases"].sum().reset_index()
totals.sort_values(by='Date', ascending=True, inplace=True)

totals['Date'] = pd.to_datetime(totals['Date'])
by_date['Date'] = pd.to_datetime(by_date['Date'])

### iterate through totals df so there is only one document per day
for index, row in totals.iterrows():
    date = row['Date']
    ### base post object
    post = {
        'date': row['Date'],
        'total_confirmed': row['Confirmed Cases'],
        'total_recovered': row['Recovered Cases'],
        'total_deaths': row['Death Cases'],
        'locations': {} ### this will be updated in the next itteration
        }
    ### iterate through by_date df to store relevant data
    for i, r in by_date.iterrows():
        ### only add to post if the date in by_date df matches the date in current itteration of totals df
        if r['Date'] == date:
            location = r['Province/State']
            ### temporary object to hold data that will be added to "locations" in post
            obj = {
                        "region": r['Country/Region'],
                        "lat": r["Lat"],
                        "lng": r["Long"],
                        "confirmed": r["Confirmed Cases"],
                        "recovered": r["Recovered Cases"],
                        "deaths": r["Death Cases"]
                    }
            ### add obj data to posted data
            post['locations'][location] = obj

            ### upload post to Mongo DB
        else:

            continue
    id = collection.insert_one(post).inserted_id
