from selenium import webdriver as wb
from time import sleep

def scrape():

    driver = wb.Chrome()
    driver.get("https://www.pharmaceutical-technology.com/news/coronavirus-a-timeline-of-how-the-deadly-outbreak-evolved/")

    articles = driver.find_elements_by_class_name('cc-blockquote')
    current_date = driver.find_elements_by_class_name('update-date')[0].text
    current_headline = driver.find_elements_by_xpath("//h1")[1].text

    dates = driver.find_elements_by_class_name('update-date')

    news_feed = {};
    i = 0
    for x in articles:
        date = x.find_element_by_class_name('update-date').text
        headline = x.find_elements_by_xpath("//h2//strong")[i].text
        news_feed[f"article{i}"] = {'date': date, 'headline': headline}
        i = i + 1
    return news_feed
