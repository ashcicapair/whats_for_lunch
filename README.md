# 午餐吃什麼

## 介紹
隨機抽取名單中的餐廳，並在地圖裡顯示路線和餐廳資訊，具備查詢餐廳、加入/刪除候選名單的功能。
<br>
表單設計使用React-Bootstrap的樣式，
<br>
串接google地圖API來實現定位與路線規劃、取得餐廳資訊等操作，
<br>
使用套件呈現抽籤用輪盤與旋轉、抽選功能。


## 套件安裝
請安裝以下套件確保正常執行:

1. react
2. @emotion/react
3. @emotion/styled
4. react-bootstrap
5. @react-google-maps/api
6. @lucky-canvas/react

## 使用方法
1. 複製整份whatsforlunch檔案到你的專案目錄
2. 安裝所需套件(npm install)
3. 在終端機中輸入npm start指令運行
4. 詳見注意事項

## 注意事項
專案執行時會使用到Google地圖平台中以下3個API:
* Maps JavaScript API
* Places API
* Directions API

需先申請帳號並啟用，串接API時需填入API Key，請事先申請以確保專案正常執行。

## Demo
![Demo]([https://github.com/ashcicapair/whats_for_lunch/blob/055f1c33a3140d9cb073bc19683dca7c442bce27/Demo.gif])
