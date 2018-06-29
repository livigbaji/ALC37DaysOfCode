

class App{

    
    static disableBoxes(state = true){
        document.querySelectorAll('[data-from] input, [data-to] input').forEach(box => {
            box.disabled = state;
        })
    }

    static enableCurrencyLinks(){
        document.querySelectorAll('h5[data-currency]').forEach(link => {
            link.addEventListener('click', function(){
                this.classList.add('caller');
                M.Modal.getInstance(document.querySelector('.modal'),{
                    onCloseEnd : function(){
                        document.querySelector('h5.caller').classList.remove('caller');   
                    }
                }).open();
            })
        })    
    }

    static swap(){
        let from = document.querySelector('[data-from]').children[0];
        let to = document.querySelector('[data-to]').children[0];
        from.replaceWith(to.cloneNode(true));
        to.replaceWith(from.cloneNode(true));
        Conversion.current.reverse();
        App.enableCurrencyLinks();
        Conversion.listen();
    }

    

    static init(){
        return new Promise((resolve, reject) => {
            Currency.init()
            .then(result => resolve(Object.values(result)), reject)
            .catch(reject)//error occured while setting up APP
        })
    }

    static initCurrencyList(currencies){

        let list = document.querySelector('.collection');
        currencies.forEach(key => {
            let option = document.createElement('li');
            option.classList.add('collection-item');
            option.dataset.currency = key.currencyId;
            option.innerText = `${key.currencyName}(${key.currencySymbol})`;
            option.style.cursor = 'pointer';
            list.appendChild(option);
        })

        document.querySelectorAll('.collection li').forEach(li => {
            li.addEventListener('click', function(){
                let caller = document.querySelector('.caller');
                let list = document.querySelector('.collection');
                let to = document.querySelector('h5[data-currency]:not(.caller)')
                let parent = caller.parentElement.parentElement.parentElement;
                let isFrom = 'from' in parent.dataset;
                let key = Currency.get(this.dataset.currency)
                Conversion.exist(this.dataset.currency, to.dataset.currency, isFrom)
                .then(() => {
                        Conversion.setRate(this.dataset.currency, to.dataset.currency, isFrom)
                        App.disableBoxes(false);
                        caller.querySelector('span').innerText = `${key.currencyName}(${key.currencySymbol})`;
                        caller.dataset.currency = this.dataset.currency;
                        document.querySelector('[data-date]').innerHTML = Conversion.current.date;
                }, reason => M.toast({html : 'Conversion data not yet available for this currency'}))
                .catch(err => {
                    M.toast({html : 'Conversion data not yet available for this currency'})
                        App.disableBoxes()                    
                })
                .then(() => {
                    document.querySelector('.modal input').value = '';
                    document.querySelectorAll('.collection li').forEach(option => option.style.display = 'block');
                    M.Modal.getInstance(document.querySelector('.modal')).close();
                    caller.classList.remove('caller');  
                })
            })
        })
    }

    
}


class Currency{
    static search(){
        let options = Array.from(document.querySelectorAll('.collection li'));
        if(this.value.trim()){
            let matches = Currency.get().filter(country => !Object.values(country).find(e => e.match(new RegExp(this.value.trim(),'ig') ) ) )
            .map(country => country.currencyId);
            options.filter(option => matches.includes(option.dataset.currency)).forEach(option => option.style.display = 'none');
        }else{
            options.forEach(option => option.style.display = 'block');
        }
    }

    static fetch(){
        return new Promise((resolve, reject)=>{
            fetch('https://free.currencyconverterapi.com/api/v5/countries')
            .then(res => res.json(), reject)
            .then(({results}) => resolve(results), reject)
            .catch(reject)
        })
    }

    static get(key){
        let all = Object.values(this.store)
        return key ? all.find(country => country.currencyId == key) : all;
    }

    static save(currencies){
        this.store = currencies || [];
        return this.store;
    }

    static init(){
        return new Promise((resolve, reject) => {
            this.fetch()
            .then(currencies =>  Promise.resolve(this.save(currencies)), reject)
            .then(resolve, reject)
            .catch(reject)
        })
    }

}

class Conversion{
    
    static listen(){
        document.querySelectorAll('[data-from] input, [data-to] input').forEach(box => {
            box.addEventListener('input', this.changeEvent);
            //box.addEventListener('keyup', changeEvent);
        })
    }

    static changeEvent(){
        let isFrom = ('from' in this.parentElement.parentElement.parentElement.parentElement.dataset)
        Conversion.current.convert(isFrom);
    }

    static exist(from, to, forward = true){
        if(!forward) [from, to] = [to, from];
        return new Promise((resolve, reject)=>{
            if(navigator.onLine) return resolve(true);
            if(from == to) return resolve(true);
            this.store.getItem(`${from}_${to}`)
            .then(item => item ? resolve(true) : reject(false), reject)
            .catch(reject)
        })
    }

    reverse(){
        this.rate = 1/this.rate;
        [this.from, this.to] = [this.to, this.from];
    }



    static get store(){
        return localforage.createInstance({
            name : 'rates'
        })
    }

    update(){
        return new Promise((resolve, reject)=>{
            (this.from == this.to ? Promise.resolve({
                [`${this.from}_${this.to}`] : {val : 1}
            }) : this.fetch())
            .then(rate => this.save(rate), reject)
            .then(resolve)
            .catch(reject)
        })
    }
    
    

     constructor(from, to, forward){
         App.disableBoxes()
        if(!forward) [from, to] = [to, from];
        this.from = from;
        this.to = to;

        this.get()
        .then(item => {
            this.rate = item.rate || null;
            this.date = item.date || null;
            this.convert(forward);
            App.disableBoxes(false);
            Conversion.current = this;
        })
    }


    get(){
        return Conversion.store.getItem(`${this.from}_${this.to}`)
        .then(item => {
            return item ? Promise.resolve(item) : this.update()
        })
    }

    fetch(){
        return fetch(`https://free.currencyconverterapi.com/api/v5/convert?q=${this.from}_${this.to}&compact=y`)
        .then(res => res.json())
    }

    save(rates){
        let date = new Date;
        Conversion.store.setItem(`${Object.keys(rates)[0].split('_').reverse().join('_')}`, {
            date,
            rate : 1/Object.values(rates)[0].val
        })
        
        return Conversion.store.setItem(`${Object.keys(rates)[0]}`, {
            date,
            rate : Object.values(rates)[0].val
        })
    }

    convert(forward = true){
        this[forward ? 'forward' : 'backward']();
    }

    forward(){
        let fromInput = document.querySelector('[data-from] input');
        let toInput = document.querySelector('[data-to] input');
        toInput.value = fromInput.value * (this.rate || Conversion.current.rate);
    }

    backward(){
        let fromInput = document.querySelector('[data-to] input');
        let toInput = document.querySelector('[data-from] input');
        toInput.value = fromInput.value * 1/(this.rate || Conversion.current.rate);
    }

    
    static setRate(from, to, forward = true){
        return new Conversion(from, to, forward);
    }

    static updateCurrent(){
        Conversion.current.update()
        .then(rate => {
            Conversion.current.convert()
            document.querySelector('[data-date]').innerHTML = rate.date;
        })
    }
}



document.addEventListener('DOMContentLoaded', function(){
    App.init()
    .then(currencies => {
        Conversion.listen();
        document.querySelectorAll('h5[data-currency]').forEach(link => {
            let key = currencies[0];
            link.dataset.currency = key.currencyId;
            link.querySelector('span').innerText = `${key.currencyName}(${key.currencySymbol})`
        })

        M.Modal.init(document.querySelectorAll('.modal'));
        App.enableCurrencyLinks()
        Conversion.setRate(currencies[0].currencyId, currencies[0].currencyId);
        App.initCurrencyList(currencies)
        document.querySelector('[data-date]').innerHTML = new Date;
    }, err => M.toast({html : err}))
    .catch(err =>  M.toast({html: err}))

    document.querySelector('.modal input').addEventListener('input', Currency.search)

    document.querySelector('[data-update]').addEventListener('click', Conversion.updateCurrent)

    document.querySelector('#swap').addEventListener('click', App.swap)
})