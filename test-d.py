
def hellos() :
    import sys
    import requests
    from bs4 import BeautifulSoup
    import os
    i = 0
    day = 0
    day = sys.argv[1]
    res = requests.get("https://laftel.net/daily")
    res.encoding = 'utf-8'
    res.raise_for_status()
    soup = BeautifulSoup(res.text, "html.parser")

    first_image = soup.find(attrs={"data-index":str(day)})
    
    images = first_image.find_all("img")
    j = 0
    sys.stdout = open('./views/anime_name.txt', 'w', encoding="UTF-8")

    for idx, image in enumerate(images):

        image_url = image["alt"]
        print(image_url[:-10])
    sys.stdout.close()

if __name__=="__main__":
    hellos()

