
function enableConverters(){
    document.querySelectorAll('[data-conversion]').forEach(link => {
        link.addEventListener('click', function(){
            this.classList.add('caller');
            let modal = M.Modal.getInstance(document.querySelector('.modal'));
            modal.open();
        })
    })

    document.querySelectorAll('[data-from] input, [data-to] input').forEach(box => {
        box.addEventListener('input', changeEvent);
        //box.addEventListener('keyup', changeEvent);
    })
}


function changeEvent(){
    let otherInput = Array.from(document.querySelectorAll('[data-from] input, [data-to] input')).find(input => input != this);
    //if under from, use as is, if under to, inver rate
    let thisParent = this.parentElement.parentElement.parentElement.parentElement
    let rate = Object.values(JSON.parse(document.querySelector('[data-rate]').dataset.rate))[0].val;
    let factor = ('from' in thisParent.dataset) ? rate : 1/rate;

    otherInput.value = factor * this.value;
}

function setRate(){
    return new Promise((resolve, reject)=>{
        let from = JSON.parse(document.querySelector('[data-from] [data-conversion]').dataset.conversion);
        let to = JSON.parse(document.querySelector('[data-to] [data-conversion]').dataset.conversion);
        fetch(`https://free.currencyconverterapi.com/api/v5/convert?q=${from.currencyId}_${to.currencyId}&compact=y`)
        .then(res => res.json())
        .then(data => {
            console.log(data)
            document.querySelector('[data-rate]').dataset.rate = JSON.stringify(data)
            resolve(true)
        }, err => {
            M.toast({html: 'A Network Error occured while fetching conversion rate, please try again.'})
            reject(false);
        })
        .catch(err =>  {
            M.toast({html: 'A Network Error occured while fetching conversion rate, please try again.'})
            reject(false)
        })
    })
    
}

document.addEventListener('DOMContentLoaded', function(){
    M.Modal.init(document.querySelectorAll('.modal'));
    enableConverters();
    fetch('https://free.currencyconverterapi.com/api/v5/countries')
    .then(res => res.json())
    .then(({results}) => {
        let list = document.querySelector('.collection');
        Object.values(results).forEach(key => {
            let option = document.createElement('li');
            option.classList.add('collection-item');
            option.dataset.currency = JSON.stringify(key);
            option.innerText = `${key.currencyName}(${key.currencySymbol})`;
            option.style.cursor = 'pointer';
            list.appendChild(option);
        })

        document.querySelectorAll('.collection li').forEach(li => {
            li.addEventListener('click', function(){
                let caller = document.querySelector('.caller');
                caller.dataset.conversion = this.dataset.currency;
                let key = JSON.parse(this.dataset.currency);
                caller.querySelector('span').innerText = `${key.currencyName}(${key.currencySymbol})`
                setRate().then(() => {
                    document.querySelectorAll('[data-from] input, [data-to] input').forEach(box => {
                        box.disabled = false;
                    })
                })
                .catch(err => {
                    document.querySelectorAll('[data-from] input, [data-to] input').forEach(box => {
                        box.disabled = true;
                    })
                })
                .then(() => {
                    M.Modal.getInstance(document.querySelector('.modal')).close();
                    caller.classList.remove('caller');  
                })
            })
        })

        document.querySelectorAll('[data-conversion]').forEach(link => {
            let key = Object.values(results)[0];
            link.dataset.conversion = JSON.stringify(key);
            link.querySelector('span').innerText = `${key.currencyName}(${key.currencySymbol})`
            document.querySelector('[data-rate]').dataset.rate = JSON.stringify({[`${key.currencyId}_${key.currencyId}`] : {val : 1}});
        })

        

    }, err => M.toast({html : err}))
    .catch(err =>  M.toast({html: err}))


    

    
    
    document.querySelector('.modal input').addEventListener('input', function(){
        let options = Array.from(document.querySelectorAll('.collection li'));
        if(this.value.trim()){
            options.filter(option => !Object.values(JSON.parse(option.dataset.currency)).find(e => e.match(new RegExp(this.value.trim(),'ig'))))
            .forEach(option => option.style.display = 'none');
        }else{
            options.forEach(option => option.style.display = 'block');
        }
    })

    
    

    document.querySelector('#swap').addEventListener('click', function(){
        let from = document.querySelector('[data-from]').children[0];
        let to = document.querySelector('[data-to]').children[0];
        from.replaceWith(to.cloneNode(true));
        to.replaceWith(from.cloneNode(true));
        let rate = JSON.parse(document.querySelector('[data-rate]').dataset.rate);
        rate = { [Object.keys(rate)[0].split('_').reverse().join('_')]:
            {val : 1/Object.values(rate)[0].val}
        }
        document.querySelector('[data-rate]').dataset.rate = JSON.stringify(rate);
        enableConverters();
    })
})