const toCurrency = price => {
  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  }).format(price);
};

document.querySelectorAll('.js-format').forEach(node => {
  node.textContent = toCurrency(node.textContent);
});

const toDate = date => {
  const options = {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };
  return Intl.DateTimeFormat('en-US', options).format(new Date(date));
};

document.querySelectorAll('.js-date-format').forEach(date => {
  date.textContent = toDate(date.textContent);
  console.log(date);
});

const $cart = document.querySelector('#cart');

if ($cart) {
  $cart.addEventListener('click', event => {
    if (event.target.classList.contains('js-cart-remove')) {
      const cartItemID = event.target.dataset.id;
      const csrf = event.target.dataset.csrf;
      fetch('/cart/remove/' + cartItemID, {
        method: 'delete',
        headers: {
          'X-XSRF-TOKEN': csrf,
        },
      })
        .then(res => {
          return res.json();
        })
        .then(cart => {
          if (cart.bikes.length) {
            const html = cart.bikes
              .map(b => {
                return `
              <tr>
                <td>${b.name}</td>
                <td>${b.price}</td>
                <td>${b.count}</td>
                <td>
                  <button class="btn btn-small js-cart-remove" data-id=${b._id}>Delete from cart</button>
                </td>
              </tr>
            `;
              })
              .join('');
            $cart.querySelector('tbody').innerHTML = html;
            $cart.querySelector('.js-price').textContent = toCurrency(
              cart.price
            );
          } else {
            $cart.innerHTML = '<p>Cart is empty.</p>';
          }
        });
    }
  });
}

const $auth = document.querySelector('.auth');

if ($auth) {
  const instance = M.Tabs.init($auth.querySelectorAll('.tabs'));
}

// const saveLocal = function (data) {
//   localStorage.setItem(Object.keys(data), Object.values(data));
// };
