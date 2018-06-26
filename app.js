
function enableConverters(){
    document.querySelectorAll('[data-conversion]').forEach(link => {
        link.addEventListener('click', function(){
            this.classList.add('caller');
            let modal = M.Modal.getInstance(document.querySelector('.modal'));
            modal.open();
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
                M.Modal.getInstance(document.querySelector('.modal')).close();
                caller.classList.remove('caller');
            })
        })

        document.querySelectorAll('[data-conversion]').forEach(link => {
            let key = Object.values(results)[0];
            link.dataset.conversion = JSON.stringify(key);
            link.querySelector('span').innerText = `${key.currencyName}(${key.currencySymbol})`
        })
    }, err => M.toast({html : err}))
    .catch(err =>  M.toast({html: err}))


    function changeEvent(){
        fetch('https://free.currencyconverterapi.com/api/v5/convert?q=USD_NGN&compact=y')
        .then(res => res.json())
        .then(console.log, console.log)
        .catch(console.log)
    }

    document.querySelectorAll('[data-from] input, [data-to] input').forEach(box => {
        box.addEventListener('change', changeEvent);
        box.addEventListener('keyup', changeEvent);
    })
    
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
        enableConverters();
    })
})