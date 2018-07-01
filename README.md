# ALC37DaysOfCode
Andela Learning Community 7 days of code Challenge for Mobile Web Specialist and is located [Here](https://bestbrain10.github.io/ALC37DaysOfCode)



## About

This project uses ES6 and other modern browser features such as indexedDB, service worker and the cache API to fetch currency conversion information from Freecurrencyconverterapi to convert currencies regardless of whether users are online or offline.

When offline, the user can only access previously used conversions




## Todo

### On service worker installation

- [x] Prefetch all currencies from `https://free.currencyconverterapi.com/api/v5/countries` and save in indexedDB

- [x] save materialize

- [x] save index.html

- [x] save app.js

- [x] save every conversion as

```js
    {
        date : date last fetched
        rate : Number 
        key : from_to
    }
```


### App Structure

- [x] show current date on-top the page, to show the user the last date and time data was gotten

- [x] use prefetched currencies as options in dropdown select
