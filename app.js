// have JQuery make sure the page loads prior to script running
$(document).ready(function(){
    
});

//////////////////////////////
// Budget Controller Module //
//////////////////////////////

// create IIFE to establish data privacy
var budgetController = (function () {
    
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(current){
            sum += current.value;
        });
        data.totals[type] = sum;
    }
    
    // hold all income, expenses, and totals in an object
    var data = {
        allItems: {
            expense: [],
            income: []
        },
        totals: {
            expense: 0,
            income: 0
        },
        budget: 0,
        percentage: -1
    };
    
    // make some public methods
    return {
        addItem: function (type, desc, val) {
            var newItem, ID;
            
            // create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0; 
            }
            
            // create new item based on inc/exp
            if (type === 'expense'){
                newItem = new Expense(ID, desc, val);
            } else if (type === 'income'){
                newItem = new Income(ID, desc, val);
            }
            
            // push into data structure
            data.allItems[type].push(newItem);
            
            // return the new element
            return newItem;
        },
        
        calculateBudget: function(){
            
            // calculate total income and expenses
            calculateTotal('expense');
            calculateTotal('income');
            
            // calculate the budget: income - expenses
            data.budget = (data.totals.income - data.totals.expense);
            
            // calculate the percentage of income that we spent
            if(data.totals.income > 0){
                data.percentage = Math.round((data.totals.expense / data.totals.income) * 100);    
            } else {
                data.percentage = -1;
            }
            
        },
        
        getBudget: function(){
            return {
                budget:     data.budget,
                totalInc:   data.totals.income,
                totalExp:   data.totals.expense,
                percentage: data.percentage                
            };
        },
        
        testing: function() {
            console.log(data);
        }       
            
    };
    
})();

//////////////////////////
// UI Controller Module //
//////////////////////////

var UIController = (function(){
    var DOMstrings = {
        inputType:          '.add__type',
        inputDescription:   '.add__description',
        inputValue:         '.add__value',
        inputBtn:           '.add__btn',
        incomeContainer:    '.income__list',
        expensesContainer:  '.expenses__list',
        budgetLabel:        'budget__value',
        incomeLabel:        'budget__income--value',
        expensesLabel:      'budget__expenses--value',
        percentageLabel:    'budget__expenses--percentage'
    };
    
    return {
        getInput: function(){
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be either income or expense
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)  
            };
        },
        
        addListItem: function(obj, type){
            var html, newHtml, element;
            
            // create HTML string with placeholder text
            if(type ==='income'){
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div<div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';                
            } else if (type === 'expense'){
                element = DOMstrings.expensesContainer;
                
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';                
            }        
                    
            // replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);
            
            // insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
              
        },
        
        // I have no idea what I'm doing here
        clearFields: function(){
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });
            
            // set cursor focus on description input box
            fieldsArr[0].focus();
        },
        
        displayBudget: function(obj){
            /* 
            Playing around. Didn't work either
            document.getElementById(DOMstrings.budgetLabel).innerHTML = obj.budget;
            document.getElementById(DOMstrings.incomeLabel).innerHTML = obj.totalInc;
            document.getElementById(DOMstrings.expensesLabel).innerHTML = obj.totalExp;
            document.getElementById(DOMstrings.percentageLabel).innerHTML = obj.percentage;
            */
            
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;
            
        },
        
        getDOMstrings: function(){
            return DOMstrings;
        }
    }
    
})();

//////////////////////////////////
// Global App Controller Module //
//////////////////////////////////

var controller = (function(budgetCtrl, UICtrl){
    
    var DOM = UICtrl.getDOMstrings();
    
    var setupEventListeners = function(){
        // Event listener for when the add button is clicked
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        // Event listener for the ENTER keyPress event
        document.addEventListener('keypress', function(event) {
            if(event.keycode === 13 || event.which === 13){
            ctrlAddItem();
            }
        })
    };
    
    var updateBudget = function(){
        
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        
        // 2. Return the budget 
        var budget = budgetCtrl.getBudget();
        
        // 3. Display the budget on the UI
        UICtrl.displayBudget(budgetCtrl.getBudget());
    };
    
    var ctrlAddItem = function(){
        var input, newItem;
        // 1. Get the field input data
        input = UICtrl.getInput();
        
        // require appropriate input values in order to add a newItem
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);
            // 4. Clear the fields
            UICtrl.clearFields();
            // 5. Calculate and update budget
            updateBudget();            
        }      
    }
    
    return {
        init: function(){
            console.log('Starting app.');
            setupEventListeners();
        }
    }
    
})(budgetController, UIController);

controller.init();