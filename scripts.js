const Modal = {
    open() {
        document
            .querySelector('.modal-overlay')
            .classList
            .add('active')
    },

    close() {
        document
            .querySelector('.modal-overlay')
            .classList
            .remove('active')
    }
}

let transactions = []

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances: transactions")) || []
        //json.parse: transforma a string em array
    },

    set(transactiosn) {
        localStorage.setItem("dev.finances: transactions", JSON.stringify(transactions)) //json.stringfy: transforma o array transaction em um string
    }

}

// somar entradas e saídas e depois tirar a diferença entre elas

const Transaction = {
    all: Storage.get(),
    
    add(transaction){
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes(){
        let income = 0
        //pegar todas as transações
        Transaction.all.forEach(transaction => {
            //se ela for maior que zero
            if( transaction.amount > 0 ){
                //somar a variável
                income += transaction.amount;
            }
        })
        return income
    },

    expenses(){
       let expense = 0
       //pegar todas as transações
       Transaction.all.forEach(transaction => {
        //se ela for maior que zero
        if( transaction.amount < 0 ){
            //somar a variável
            expense+= transaction.amount;
        }
        })
        return expense
    },

    total(){
        return Transaction.incomes() + Transaction.expenses();
    }
}

// pegar as transações do objeto no javascript e substituir no html

const DOM = {
    transactionContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index){
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction,index)
        tr.dataset.index = index

        DOM.transactionContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class=${CSSclass}>${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>
        `
        return html
    },

    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById('totalDisplay').innerHTML =Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionContainer.innerHTML = ""
    }
}

const Utils = {
  
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""
        
        value = String(value).replace(/\D/g, "") // /\D/ : procura valores q nao sao numero e o g: global(na string inteira)
        
        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency" ,
            currency: "BRL"
        }) 
        return signal + value
    },

    formatAmount(value) {
        value = Number(value.replace(/\,?\.?/g, "")) * 100
        return Math.round(value)
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    }
   
}

const Form = {

    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value, 
            date: Form.date.value
        }
    },

    validateFields() {
        const { description, amount, date} = Form.getValues() 

        if( description.trim() === "" || 
            amount.trim() === "" || 
            date.trim() === ""){
                throw new Error("Complete todos os campos");
        }
    },

    formatValues() {
        let { description, amount, date} = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },


    submit(event) {
        event.preventDefault()  // interrompe comportamento padrão

        try {
            // verificar se todas as informações foram preenchidas
            Form.validateFields()
            // formatar os dados para salvar
            const transaction = Form.formatValues()
            //salvar
            Transaction.add(transaction)
            // apagar o formulário
            Form.clearFields()
            // fechar modal
            Modal.close()
        } catch (error) {
            alert(error.message);
        }



        
    }
}

const App = {
    init() {

        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
        }) 
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },

    reload() {
        DOM.clearTransactions()
        App.init()
    }
}


App.init()




