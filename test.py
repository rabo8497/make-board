
def hello() :
    import sys
    import requests
    from bs4 import BeautifulSoup
    import os
    i = 0
    day = 0
    day = sys.argv[1]
    while 1 :
        if os.path.isfile("views\popular_pictures\movie{}.jpg".format(i+1)) :
            #print(1)
            os.remove('./views/popular_pictures/movie{}.jpg'.format(i+1))
            i += 1
        else :
            break
    res = requests.get("https://laftel.net/daily")
    res.raise_for_status()
    soup = BeautifulSoup(res.text, "html.parser")

    first_image = soup.find(attrs={"data-index":str(day)})

    images = first_image.find_all("img")
    print(len(images))
    j = 0
    for idx, image in enumerate(images):

        image_url = image["src"]
        image_res = requests.get(image_url)
        image_res.raise_for_status()
    
        with open("./views/popular_pictures/movie{}.jpg".format(idx+1), "wb") as f: 
            f.write(image_res.content)
        j += 1

if __name__=="__main__":
    hello()

