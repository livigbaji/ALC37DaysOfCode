# ALC37DaysOfCode
Andela Learning Community 7 days of code Challenge for Mobile Web Specialist


## About

This project uses ES6 and other modern browser features such as indexedDB, service worker and the cache API to fetch currency conversion information from Freecurrencyconverterapi to convert currencies regardless of whether users are online or offline.





## Todo

### On service worker installation

- [ ] Prefetch all currencies from `https://free.currencyconverterapi.com/api/v5/countries` and save in indexedDB

- [x] save materialize

- [x] save index.html

- [x] save app.js

- [ ] save every conversion as

```js
    {
        date : date last fetched
        rate : 
        currencies : ['NGN', 'USD'] should match ['USD' 'NGN']
    }
```


### App Structure

- [ ] show current date on-top the page, to show the user the last date and time data was gotten

- [x] use prefetched currencies as options in dropdown select