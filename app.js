//////////////////////////////
// Budget Controller Module //
//////////////////////////////

// create IIFE to establish data privacy
var budgetController = (function () {
    
    var Expense = function (id, description, value) {
        this.id =           id;
        this.description =  description;
        this.value =        value;
        this.percentage =   -1
    };
    
    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
            
        } else {
            this.percentage = -1;
        } 
    };
    
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };
    
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (current) {
            sum += current.value;
        });
        data.totals[type] = sum;
    };
    
    // hold all income, expenses, and totals in an object
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
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
            if (type === 'exp') {
                newItem = new Expense(ID, desc, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, desc, val);
            }
            
            // push into data structure
            data.allItems[type].push(newItem);
            
            // return the new element
            return newItem;
        },
        
        deleteItem: function (type, id) {
            var ids, index;
            
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            
            index = ids.indexOf(id);
            
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        
        calculateBudget: function () {
            
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // calculate the budget: income - expenses
            data.budget = (data.totals.inc - data.totals.exp);
            
            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            
        },
        
        calculatePercentages: function () {
            
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },
        
        getPercentages: function () {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },
        
        getBudget: function () {
            return {
                budget:     data.budget,
                totalInc:   data.totals.inc,
                totalExp:   data.totals.exp,
                percentage: data.percentage
            };
        },
        
        testing: function () {
            console.log(data);
        }
    };
    
})();

//////////////////////////
// UI Controller Module //
//////////////////////////

var UIController = (function () {
    var DOMstrings = {
        inputType:          '.add__type',
        inputDescription:   '.add__description',
        inputValue:         '.add__value',
        inputBtn:           '.add__btn',
        incomeContainer:    '.income__list',
        expensesContainer:  '.expenses__list',
        budgetLabel:        '.budget__value',
        incomeLabel:        '.budget__income--value',
        expensesLabel:      '.budget__expenses--value',
        percentageLabel:    '.budget__expenses--percentage',
        container:          '.container',
        expensesPercLabel:  '.item__percentage'
    };
    
    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be either income or expense
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        
        addListItem: function (obj, type) {
            var html, newHtml, element;
            
            // create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div<div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);
            
            // insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
              
        },
        
        deleteListItem: function (selectorID) {
            var el;
            el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        
        // I have no idea what I'm doing here
        clearFields: function () {
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });
            
            // set cursor focus on description input box
            fieldsArr[0].focus();
        },
        
        displayBudget: function (obj) {
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;
                        
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
        
        displayPercentages: function (percentages) {
            
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            // I have no idea what I'm doing here!
            var nodeListForEach = function(list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }    
            };
            
            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';    
                } else {
                    current.textContent = '---'
                }        
            });
        },
        
        getDOMstrings: function () {
            return DOMstrings;
        }
    };
    
})();

//////////////////////////////////
// Global App Controller Module //
//////////////////////////////////

var controller = (function (budgetCtrl, UICtrl) {
    
    var DOM = UICtrl.getDOMstrings();
    
    var setupEventListeners = function () {
        // Event listener for when the add button is clicked
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        // Event listener for the ENTER keyPress event
        document.addEventListener('keypress', function (event) {
            if (event.keycode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
    };
    
    var updateBudget = function () {
        
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        
        // 2. Return the budget 
        var budget = budgetCtrl.getBudget();
        
        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };
    
    var updatePercentages = function() {
        
        // 1. calculate percentages
        budgetCtrl.calculatePercentages();
        // 2. read percentages from budget controller
        var percentages = budgetCtrl.getPercentages();
        // 3. update the UI
        UICtrl.displayPercentages(percentages);
    };
    
    var ctrlAddItem = function () {
        var input, newItem;
        // 1. Get the field input data
        input = UICtrl.getInput();
        
        // require appropriate input values in order to add a newItem
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);
            // 4. Clear the fields
            UICtrl.clearFields();
            // 5. Calculate and update budget
            updateBudget();
            // 6. Calculate and update percentages
            updatePercentages();
        }
    };
    
    var ctrlDeleteItem = function (event) {
        var itemID, splitID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // 1. delete item from data structure
            budgetCtrl.deleteItem(type, ID);
            // 2. delete item from ID
            UICtrl.deleteListItem(itemID);
            // 3. update and display new budget
            updateBudget();
            // 4. Calculate and update percentages
            updatePercentages();
        }
        
    };
    
    return {
        init: function () {
            console.log('Starting app.');
            UICtrl.displayBudget({
                budget:     0,
                totalInc:   0,
                totalExp:   0,
                percentage: -1
            });
            setupEventListeners();
        }
    };
    
})(budgetController, UIController);

controller.init();