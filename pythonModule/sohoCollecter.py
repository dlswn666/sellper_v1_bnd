from selenium import webdriver
from selenium.webdriver.chrome.service import Service
import chromedriver_autoinstaller
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup
import os
import json

import mysql.connector
from mysql.connector import Error

def setup_driver():
   # ChromeDriver 설치 및 경로 설정
    chromedriver_autoinstaller.install()  # 이 명령어는 chromedriver를 설치하고, 설치된 경로를 반환합니다.
    driver = webdriver.Chrome()
    return driver

def login(driver, url, user_id, password):
    login_a_tag = driver.find_element(By.CSS_SELECTOR, '#hdr > ul > li:nth-child(1) > a')
    login_a_tag.click()
    
    id_input = driver.find_element(By.CSS_SELECTOR, '#login > div > form > fieldset > ul > li.mid > input')
    id_input.send_keys(user_id)
    
    password_input = driver.find_element(By.CSS_SELECTOR, '#login > div > form > fieldset > ul > li.mpasswd > input')
    password_input.send_keys(password)
    
    login_button = driver.find_element(By.CSS_SELECTOR, '#login > div > form > fieldset > a > img')
    login_button.click()

def get_html_from_urls(driver, url_list):
    collected_data = []
    
    for url in url_list:
        try:
            driver.get(url)
            html = driver.page_source
            collected_data.append((html, url))
        except Exception as e:
            print(f"Error loading URL {url}: {e}")
            continue

    return collected_data

def extract_product_data(html, product_url ,base_url):
    soup = BeautifulSoup(html, 'html.parser')
    
    product_data = {}
    
    product_data['url'] = product_url
    
    img_element = soup.select_one('#lens_img')
    if img_element and 'src' in img_element.attrs:
        product_data['image_url'] = base_url + img_element['src']
    
    title_element = soup.select_one('#form1 > div > h3')
    if title_element:
        product_data['title'] = title_element.get_text(strip=True)
    
    origin_element = soup.select_one('#form1 > div > div.table-opt > table > tbody > tr:nth-child(1) > td > div')
    if origin_element:
        product_data['origin'] = origin_element.get_text(strip=True)
    
    product_number_element = soup.select_one('#form1 > div > div.table-opt > table > tbody > tr:nth-child(2) > td > div')
    if product_number_element:
        product_data['product_number'] = product_number_element.get_text(strip=True)
    
    shipping_method_element = soup.select_one('#form1 > div > div.table-opt > table > tbody > tr:nth-child(3) > td > div')
    if shipping_method_element:
        product_data['shipping_method'] = shipping_method_element.get_text(strip=True)
    
    shipping_cost_element = soup.select_one('#form1 > div > div.table-opt > table > tbody > tr:nth-child(4) > td > div')
    if shipping_cost_element:
        product_data['shipping_cost'] = shipping_cost_element.get_text(strip=True)
    
    price_element = soup.select_one('#form1 > div > div.table-opt > table > tbody > tr:nth-child(5) > td.price > div')
    if price_element:
        product_data['price'] = price_element.get_text(strip=True)
    
    option_element = soup.select_one('#form1 > div > div.table-opt > table > tbody > tr:nth-child(6) > td > div > dl > dd > select')
    if option_element:
        product_data['option'] = [option.get_text(strip=True) for option in option_element.find_all('option')]
    
    info_grid_element = soup.select_one('#productWrap2')
    if info_grid_element:
        product_data['info_grid'] = info_grid_element.prettify()
    
    detail_info_element = soup.select_one('.prd-detail')
    if detail_info_element:
        product_data['detail_info'] = detail_info_element.prettify()
    
    return product_data

def create_connection(host_name, user_name, user_password, db_name):
    connection = None
    try:
        connection = mysql.connector.connect(
            host=host_name,
            user=user_name,
            passwd=user_password,
            database=db_name
        )
        print("MySQL Database connection successful")
    except Error as e:
        print(f"The error '{e}' occurred")
    
    return connection

def insert_product(connection, product_data):
    insert_query = """
    INSERT INTO PRODUCTS_DATA (product_title, product_url, product_price, product_num, thumbnail_url, detail_page_url, origin, detail_info, prd_options, shipping_info)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    cursor = connection.cursor()
    try:
        cursor.execute(insert_query, (
            product_data.get('title'),
            product_data['url'],
            product_data.get('price'),
            product_data.get('product_number'),
            product_data.get('image_url'),
            product_data.get('detail_info'),
            product_data.get('origin'),
            product_data.get('info_grid'),
            ','.join(product_data.get('option', [])),
            product_data.get('shipping_cost')
        ))
        connection.commit()
        print("Product inserted successfully")
    except Error as e:
        print(f"The error '{e}' occurred")

def save_data_files(data_list, output_directory):
    if not os.path.exists(output_directory):
        os.makedirs(output_directory)
    
    for i, data in enumerate(data_list):
        with open(os.path.join(output_directory, f"product_{i+1}.json"), "w", encoding="utf-8") as file:
            json.dump(data, file, ensure_ascii=False, indent=4)

if __name__ == "__main__":
    # 웹 드라이버 설정 및 웹사이트 로그인
    driver = setup_driver()
    ## 민감 정보 
    login_url = "http://www.sohostar.co.kr/index.html"
    user_id = "dlswn666"
    password = "Injuchung2306!!"
    host_name = "jdbc:mysql://180.68.24.73:3306/selper?useSSL=false&allowPublicKeyRetrieval=TRUE"
    host_id = "selper"
    host_pw = "injuchung2306!!"
    db_name = "selper"
    try:
        driver.get('http://www.sohostar.co.kr/index.html')
        login(driver, login_url, user_id, password)

        # 크롤링할 URL 리스트
        url_list = ["URL1", "URL2", "URL3"]  # 크롤링할 URL 리스트로 교체하세요

        # URL에서 HTML 수집
        collected_html = get_html_from_urls(driver, url_list)

        # 데이터베이스 연결
       
        connection = create_connection(host_name, host_id, host_pw, db_name)

        # 수집한 HTML로부터 데이터 추출 및 데이터베이스 삽입
        base_url = "기본 URL"  # 상품 이미지 등의 상대 경로를 처리하기 위한 기본 URL 설정
        extracted_data = []
        for html, url in collected_html:
            product_data = extract_product_data(html, url, base_url)
            insert_product(connection, product_data)
            extracted_data.append(product_data)

        # 데이터를 JSON 파일로 저장
        save_data_files(extracted_data, "output_directory")

    finally:
        driver.quit()
        if connection:
            connection.close()
