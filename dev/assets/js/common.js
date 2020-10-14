import $ from '../../../node_modules/bootstrap/dist/js/bootstrap.bundle.min'

$();

// Добавьте UTM-метку utm_replace к ссылке в рекламной кампании, например
 //site.ru/?utm_campaign=name&utm_replace=moscow
    // moscow, это краткий код заголовка, которому соответствует длинный заголовок, например
    // moscow, это  «Заказать эвакуатор в Москве!»
const content = {
    moscow: 'Заказать эвакуатор в Москве!',
    kazan: 'Заказать эвакуатор в Казани!',
    spb: 'Заказать эвакуатор в Санкт-Петербурге!',
};

//  Здесь нужно между одинарными кавычками вставить селектор http://joxi.ru/GrqZodptNMNlWm
const selector = '#manager > div > div.title > div';


    // Далее ничего не меняйте, это исполняющий замену скрипт
function replacer(content) {
    const utm = /utm_replace=([^&]*)/g.exec(document.URL)[1];
    if (utm in content) {
        document.querySelector(selector).innerHTML=content[utm];
    } else {
    console.log('Каталог контента не имеет такой utm метки');
    }
}