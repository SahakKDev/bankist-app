'use strict';

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

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

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

const displayMovements = function (movements) {
  containerMovements.innerHTML = '';

  movements.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">
          ${i + 1} ${type}
        </div>
        <div class="movements__value">${mov}€</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const getBalance = movements => movements.reduce((acc, cur) => acc + cur, 0);

const calcPrintBalance = acc => {
  const { movements } = acc;
  acc.balance = getBalance(movements);

  labelBalance.textContent = `${acc.balance}€`;
};

const calcDisplaySummary = acc => {
  const { movements, interestRate } = acc;
  const incomes = movements
    .filter(mov => mov > 0)
    .reduce((acc, cur) => acc + cur, 0);

  const out = movements
    .filter(mov => mov < 0)
    .reduce((acc, cur) => acc + Math.abs(cur), 0);

  const int = movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * interestRate) / 100)
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
  calcPrintBalance(acc);
  displayMovements(acc.movements);
  calcDisplaySummary(acc);
};

// Event handlers
let currentAccount;

btnLogin.addEventListener('click', event => {
  event.preventDefault();

  currentAccount = getUser(inputLoginUsername.value);

  if (currentAccount && currentAccount.pin === +inputLoginPin.value) {
    const { owner } = currentAccount;
    containerApp.style.opacity = 1;
    const username = owner.split(' ')[0];
    labelWelcome.textContent = `Welcome back, ${username}`;

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
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    updateUI(currentAccount);
  }

  inputTransferTo.value = inputTransferAmount.value = '';
  inputTransferTo.blur();
  inputTransferAmount.blur();
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

////////////////////////////////////////
