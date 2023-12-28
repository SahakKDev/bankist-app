'use strict';

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [
    [200, '2022-11-18T21:31:17.178Z'],
    [455.23, '2022-12-23T07:42:02.383Z'],
    [-306.5, '2023-01-28T09:15:04.904Z'],
    [25000, '2023-12-21T10:17:24.185Z'],
    [-642.21, '2023-12-25T14:11:59.604Z'],
    [-133.9, '2023-12-26T17:01:17.194Z'],
    [79.97, '2023-12-27T19:36:17.929Z'],
    [1300, '2023-12-28T10:51:36.790Z'],
  ],
  interestRate: 1.2, // %
  pin: 1111,

  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [
    [5000, '2022-11-01T13:15:33.035Z'],
    [3400, '2022-11-30T09:48:16.867Z'],
    [-150, '2022-12-25T06:04:23.907Z'],
    [-790, '2023-01-25T14:18:46.235Z'],
    [-3210, '2023-02-05T16:33:06.386Z'],
    [-1000, '2023-04-10T14:43:26.374Z'],
    [8500, '2023-06-25T18:49:59.371Z'],
    [-30, '2023-07-26T12:01:20.894Z'],
  ],
  interestRate: 1.5,
  pin: 2222,

  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

// Functions
const getFormatedDate = (date, options, locale) => {
  return new Intl.DateTimeFormat(locale, options).format(date);
};

const formatMovementDate = (date, locale) => {
  const calcDaysPast = (date1, date2) => {
    return Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24)));
  };

  const daysPast = calcDaysPast(new Date(), date);

  if (daysPast === 0) return 'today';
  if (daysPast === 1) return 'yesterday';
  if (daysPast <= 7) return `${daysPast} days ago`;
  if (daysPast === 0) return 'today';

  return getFormatedDate(date, undefined, locale);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';
  const { movements } = acc;

  const movs = sort ? movements.slice().sort(([a], [b]) => a - b) : movements;

  movs.forEach(function ([mov, movDate], i) {
    const date = new Date(movDate);
    const displayDate = formatMovementDate(date, acc.locale);

    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">
          ${i + 1} ${type}
        </div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${mov.toFixed(2)}€</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const getBalance = movements => movements.reduce((acc, cur) => acc + cur[0], 0);

const calcDisplayBalance = acc => {
  const { movements } = acc;
  acc.balance = getBalance(movements);

  labelBalance.textContent = `${acc.balance.toFixed(2)}€`;
};

const calcDisplaySummary = acc => {
  const { movements, interestRate } = acc;
  const incomes = movements
    .filter(([mov]) => mov > 0)
    .reduce((acc, cur) => acc + cur[0], 0)
    .toFixed(2);

  const out = movements
    .filter(([mov]) => mov < 0)
    .reduce((acc, cur) => acc + Math.abs(cur[0]), 0)
    .toFixed(2);

  const int = movements
    .filter(([mov]) => mov > 0)
    .map(([deposit]) => (deposit * interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0)
    .toFixed(2);

  labelSumIn.textContent = `${incomes}€`;
  labelSumOut.textContent = `${out}€`;
  labelSumInterest.textContent = `${int}€`;
};

const createUsernames = accounts => {
  accounts.forEach(acc => {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const getUser = username => accounts.find(acc => acc.username === username);

const updateUI = acc => {
  calcDisplayBalance(acc);
  displayMovements(acc);
  calcDisplaySummary(acc);
};

let currentAccount;
let sorted = false;

// Event handlers
btnLogin.addEventListener('click', event => {
  event.preventDefault();

  currentAccount = getUser(inputLoginUsername.value);

  if (currentAccount && currentAccount.pin === +inputLoginPin.value) {
    const { owner } = currentAccount;
    containerApp.style.opacity = 1;
    const username = owner.split(' ')[0];
    labelWelcome.textContent = `Welcome back, ${username}`;

    // Crete current date and time
    const now = new Date();
    const dateOptions = {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    };

    labelDate.textContent = getFormatedDate(
      now,
      dateOptions,
      currentAccount.locale,
    );

    updateUI(currentAccount);

    // clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginUsername.blur();
    inputLoginPin.blur();
  } else {
    labelWelcome.textContent = 'Log in to get started';
    containerApp.style.opacity = 0;
  }
});

btnTransfer.addEventListener('click', event => {
  event.preventDefault();

  const amount = +inputTransferAmount.value;
  const receiverAcc = getUser(inputTransferTo.value);

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    currentAccount.username !== receiverAcc.username
  ) {
    // Doing the transfer
    currentAccount.movements.push([-amount, new Date().toISOString()]);
    receiverAcc.movements.push([amount, new Date().toISOString()]);

    updateUI(currentAccount);
  }

  inputTransferTo.value = inputTransferAmount.value = '';
  inputTransferTo.blur();
  inputTransferAmount.blur();
});

btnLoan.addEventListener('click', event => {
  event.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  const cond = currentAccount.movements.some(([mov]) => mov >= amount * 0.1);

  if (amount > 0 && cond) {
    // Add movement
    currentAccount.movements.push([amount, new Date().toISOString()]);

    updateUI(currentAccount);
  }

  inputLoanAmount.value = '';
  inputLoanAmount.blur();
});

btnClose.addEventListener('click', event => {
  event.preventDefault();

  const { username: currentUsername, pin: currentPin } = currentAccount;

  const usernameInp = inputCloseUsername.value;
  const pinInp = +inputClosePin.value;

  if (currentUsername === usernameInp && currentPin === pinInp) {
    const currentAccIndex = accounts.findIndex(
      acc => acc.username === currentUsername,
    );

    // Delete account
    accounts.splice(currentAccIndex, 1);

    labelWelcome.textContent = 'Log in to get started';
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

btnSort.addEventListener('click', () => {
  sorted = !sorted;
  displayMovements(currentAccount, sorted);
});

////////////////////////////////////////
