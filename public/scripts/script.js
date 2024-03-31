document.addEventListener("DOMContentLoaded", function () {
  const getResultsButton = document.querySelector(".getResults");

    var buttons = document.querySelectorAll('.add-discard-button');
    let total_calorie_consumption = 0, update_protein = 0, update_fat = 0, update_fiber = 0, update_carbs = 0, 
    update_vita = 0,update_vitc = 0,update_vitd = 0, update_fe = 0;

     function pieValues(calories_sum,protein,carbs,vitc,vitd,fat,fiber,vita,fe){

      fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        const tdee = data.tdee;
        const email = data.email;
        console.log("tdee", tdee);
        console.log("user email", email);

      google.charts.load("current", {packages:["corechart"]});
      google.charts.setOnLoadCallback(drawChart);

      update_protein += protein;
      update_carbs += carbs;
      update_vitc += vitc;
      update_vitd +=vitd;
      update_fat += fat;
      update_fiber += fiber;
      update_vita += vita;
      update_fe += fe;

      total_calorie_consumption += calories_sum;
      let total_calorie_left = tdee - total_calorie_consumption;
      //console.log("total_calorie_consumption",calories_sum);

      CalorieTracker(total_calorie_consumption,email,update_protein,
        update_carbs,update_vitc,update_vitd,update_fat,update_fiber,update_vita,update_fe);

      function drawChart() {
        var data3 = google.visualization.arrayToDataTable([
          ['Week Day', 'consume'],
          ['Monday', 8.94],            
          ['Tuesday', 19.30, ],
          ['Wednesday', 21.45],
          ['Thursday', 21.45],
          ['Friday', 21.45],
          ['Saturday', 21.45],
          ['Sunday', 21.45] 
       ]);
      
          var options3 = {
            title: 'Nutrition Content',
          };
        
          var chart = new google.visualization.ColumnChart(document.getElementById('columnChart'));
          chart.draw(data3,options3);
  
        var data = google.visualization.arrayToDataTable([
          ['Nutrients', 'Percent'],
          ['Carbohydrate',    carbs],
          ['Fiber',      fiber],
          ['Fat',  fat],
          ['Vit C', vitc],
          ['Vit A',    vita],
          ['Vit D',    vitd],
          ['Protein',    protein],
          ['Iron', fe],
        ]);

        var options = {
          title: 'Nutrition Content',
          pieHole: 0.4,
        };

        var chart = new google.visualization.PieChart(document.getElementById('donutchart'));
        buttons.forEach(function (button){
          button.addEventListener('click', function () {
            chart.draw(data, options);
          });
        });

        if(total_calorie_left>0){
        var data2 = google.visualization.arrayToDataTable([
          ['Calories', 'value'],
          ['Calories intake', total_calorie_consumption],
          ['Calories left',   total_calorie_left]
        ]);

        var option2 = {
          title: 'Daily Calorie',
          pieHole: 0.4,
        };

        var chart2 = new google.visualization.PieChart(document.getElementById('donutchart2'));
        buttons.forEach(function (button) {
          button.addEventListener('click', function () {
            chart2.draw(data2, option2);
          });
        });
      }
      else{

        var data2 = google.visualization.arrayToDataTable([
          ['Calories', 'value'],
          ['Calories intake', total_calorie_consumption],
          ['Calories left',   0]
        ]);

        var option2 = {
          title: 'Daily Calorie',
          pieHole: 0.4,
        };

        var chart2 = new google.visualization.PieChart(document.getElementById('donutchart2'));
        buttons.forEach(function (button) {
          button.addEventListener('click', function () {
            chart2.draw(data2, option2);
          });
        });

      }
    }
    });
        
      }

       function CalorieTracker(total_calorie_consumption,email,protein,carbs,vitc,vitd,fat,fiber,vita,fe){
        console.log("inside fn CalorieTracker");
        console.log("This is my email",email);
      fetch('/api/daily_intake',{
        method: 'POST',
        headers : {
          'Content-Type' : 'application/json'
        },
        body : JSON.stringify({
          total_sum : total_calorie_consumption,
           email : email,
           protein : protein, 
           carbs: carbs, 
           vitc:vitc, 
           vitd: vitd, fat: 
           fat, fiber:fiber,
           vita:vita,
           fe:fe
          }),  
      })
      .then(res => res.json())
      .then(data => console.log("calorieTracker function", data))
      .catch(error=> console.error("error in calorieTracker", error))
      
     } 

    getResultsButton.addEventListener("click", function () {
    const foodInput = document.querySelector(".food-input");
    const inputValue = foodInput.value.trim(); 


    if (inputValue === "") {
      console.log("Please enter a food item.");
      return;
    }

    const app_id = "39d7e8cd";
    const app_key = "76b7e70dd780851f38b48e3babc66965";

    const url = `https://api.edamam.com/api/nutrition-data?app_id=${app_id}&app_key=${app_key}&ingr=${inputValue}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
            console.log(data);

            const nutrientKeys = [
              'ENERC_KCAL',
              'VITC',
              'FAT',
              'FASAT',
              'NA',
              'CHOCDF',
              'FIBTG',
              'SUGAR',
              'PROCNT',
              'CHOLE',
              'CA',
              'K',
              'FE',
              'P',
              'VITA_RAE',
              'VITD',
              'K',
            ]; 
            
            const extractedNutrients = {};
            const dailyNuts ={};
            const foodIngr = ingredients(data);
             
              
              const newRow = document.createElement('tr');
              newRow.innerHTML=
              '<td>'+foodIngr.quantity+'</td>'+
            '<td>'+foodIngr.measure+'</td> '+
              '<td>'+foodIngr.foodMatch+'</td> '+
              '<td>'+data.calories +" kcal"+'</td> '+
              '<td>'+foodIngr.weight.toFixed(2)+ " g"+'</td> '; 
              document.getElementById('getDetails').appendChild(newRow);
   
            nutrientKeys.forEach(nutrientKey => {
              extractedNutrients[nutrientKey] = extractNutrient(data, nutrientKey);
            });
            nutrientKeys.forEach(nutrientKey => {
              dailyNuts[nutrientKey] = dailyNutrient(data,nutrientKey);
            });
            
        
            console.log(extractedNutrients);
            console.log(dailyNuts);
            console.log(foodIngr);

              const calories_sum = extractedNutrients['ENERC_KCAL']?.quantity ?? 0;
              const protein = extractedNutrients['PROCNT']?.quantity ?? 0;
              const carbs = extractedNutrients['CHOCDF']?.quantity ?? 0;
              const vitc = extractedNutrients['VITC']?.quantity ?? 0;
              const vitd = extractedNutrients['VITD']?.quantity ?? 0;
              const fat = extractedNutrients['FAT']?.quantity ?? 0;
              const fiber = extractedNutrients['FIBTG']?.quantity ?? 0;
              const vita = extractedNutrients['VITA_RAE']?.quantity ?? 0;
              const fe = extractedNutrients['FE']?.quantity ?? 0;

              

            pieValues(calories_sum,protein,carbs,vitc,vitd,fat,fiber,vita,fe);

            const DisplayNames = {
              'ENERC_KCAL' : 'Calories',
              'FAT' : 'Total Fat',
              'FASAT' : 'Saturated Fat',
              'NA' : 'Sodium',
              'CHOCDF' : 'Total Carbohydrate',
              'FIBTG' : 'Dietary Fiber',
              'SUGAR' : 'Total Sugar',
              'PROCNT' : 'Protein',
              'CHOLE' : 'Cholestrol',
              'CA' : 'Calcium',
              'K' : 'Potassium',
              'FE' : 'Iron',
              'VITD' : 'Vitamin D',
            }

            for(const i in DisplayNames){

              const nutriSpan = document.querySelector(`.${i}`);
              const nutriSpan_percent = document.querySelector(`.${i}-percent`);

              const nutrientsUnit = extractedNutrients[i];
              const nutrientsPercent = dailyNuts[i];

              console.log('extractedNutrients:', nutrientsUnit);
              console.log('dailyNuts:', nutrientsPercent);

              if (extractedNutrients[i] && dailyNuts[i] !== null) {
                if(i === 'ENERC_KCAL'){
                  nutriSpan_percent.textContent = `${Math.round(nutrientsPercent.quantity)}${nutrientsPercent.unit}`;
                
                }
                
                else{
                  console.log('1.dailyNuts:', nutrientsPercent);
                  if(extractedNutrients[i] !== null && dailyNuts[i] !== null ){

                    nutriSpan.innerHTML = `<span style="font-size: 16px;">${DisplayNames[i]} </span> ${nutrientsUnit.quantity.toFixed(2)} ${nutrientsUnit.unit}`;
                    nutriSpan_percent.textContent = `${Math.round(nutrientsPercent.quantity)}${nutrientsPercent.unit}`;
    
                  }
    
                  else if(extractedNutrients[i] === null && dailyNuts[i] !== null){
                    nutriSpan.innerHTML = `<span style="font-size: 16px;">${DisplayNames[i]} </span> -`;
                    nutriSpan_percent.textContent = `${Math.round(nutrientsPercent.quantity)}${nutrientsPercent.unit}`;
                  }
    
                  else if(extractedNutrients[i]!== null && dailyNuts[i] === null){
                    console.log('2.dailyNuts:', nutrientsPercent);
                    nutriSpan.innerHTML = `<span style="font-size: 16px;">${DisplayNames[i]} </span> ${nutrientsUnit.quantity.toFixed(2)} ${nutrientsUnit.unit}`;
                    nutriSpan_percent.textContent = '0%';
                  }
                
    
                  else{
                    nutriSpan.innerHTML = `<span style="font-size: 16px;">${DisplayNames[i]} </span> -`;
                    nutriSpan_percent.textContent = '0%';
                  }
  
                }
              
            }
            else if(extractedNutrients[i] && dailyNuts[i] === null){
              console.log('2.dailyNuts:', nutrientsPercent);
                nutriSpan.innerHTML = `<span style="font-size: 16px;">${DisplayNames[i]} </span> ${nutrientsUnit.quantity.toFixed(2)} ${nutrientsUnit.unit}`;
                nutriSpan_percent.textContent = '0%';
            }
            
            else{
              console.error(`Element with class ${i} or ${i}-percent not found.`);
            }

          }
          
        
      })
      
      
      .catch(error => {
        console.error(error);
      });

     
  });
  

  function extractNutrient(data, nutrient){
    const nutrients = data.totalNutrients[nutrient];
    if(nutrients){
      return{
        label: nutrients.label,
        quantity: nutrients.quantity,
        unit: nutrients.unit
      };
    }
    else{
      return null;
    }
  };

  function ingredients(data){
   const ingr = data.ingredients[0].parsed[0];
   
   if(ingr){
    return{
      quantity:ingr.quantity,
      measure: ingr.measure,
      foodMatch: ingr.foodMatch,
      weight: ingr.weight
    };
  }
    else{
      return null;
    }
};

  function dailyNutrient(data, percent){
    const daily = data.totalDaily[percent];
      if(daily){
        return{
          label: daily.label,
          quantity: daily.quantity,
          unit: daily.unit
        };
      }
      else{
        return null;
      }
};

});

