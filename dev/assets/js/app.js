// Change utm('utm_replace') value for your projects
const content = {
  utm_value1: [
    {
      selector: '#manager > div > div.title > div',
      content: 'Some content 1 ..',
    },
    {
      selector: '#manager > div > div.entry',
      content: '<img alt="alt" src="#" title="title">',
    },
  ],
  utm_value2: [
    {
      selector: '#towns > div',
      content: 'Some content',
    },
    {
      selector: '#manager > div > div.title > div',
      content: 'Some content 2 ...',
    },
  ],
  utm_value3: [
    {
      selector: '#manager > div > div.title > div',
      content: 'Some content 3 ...',
    },
  ],
};

// Replace content
function replacer (content, utm) {
  if (utm in content) {
    for (const i in content[utm]) {
      if (document.querySelector(content[utm][i]['selector']) != null) {
        document.querySelector(content[utm][i]['selector']).innerHTML = content[utm][i]['content'];
      }
    }
  } else {
    console.log('UTM key not found');
  }
}

// Get utm from cookies or undefined
function getCookie (name) {
  const matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

// Record utm in cookies
function setCookie(utm) {
  const date = new Date(new Date().getTime() + (30 * 24 * 60 * 60 * 1000));
  document.cookie = 'utm_replace=' + utm + '; path=/; expires=' + date.toUTCString();
}

// Main func
function replacerMain(content) {
  let utm = null;
  // check is there utm in url
  if (/utm_replace=([^&]*)/g.exec(document.URL)) {
    utm = /utm_replace=([^&]*)/g.exec(document.URL)[1];
  }

  if (utm != null) {
    replacer(content, utm);
    setCookie(utm);
  } else if (getCookie('utm_replace') !== undefined) {
    replacer(content, getCookie('utm_replace'));
  } else {
    console.log('UTM replacer not found utm key in url or cookie');
  }
}

replacerMain(content);
