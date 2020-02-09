from bs4 import BeautifulSoup as bs
import pandas as pd
import requests


url = 'https://www.pharmaceutical-technology.com/news/coronavirus-a-timeline-of-how-the-deadly-outbreak-evolved/'
response = requests.get(url)
soup = bs(response.text, 'html.parser')

def scrape():
    block = soup.find_all(class_='cc-blockquote')
    i = 0
    news_feed = {};
    for x in block:
        date = x.find(class_='update-date').find('strong').text

        if x.find(class_='update-date').find('h1') == None:
            headline = x.find(class_='update-date').find('h2').text
        else:
            headline = x.find(class_='update-date').find('h1').text

        news_feed[f"article{i}"] = {
            'date': date,
            'headline': headline
        }
        i = i + 1
    return(news_feed)
scrape()
