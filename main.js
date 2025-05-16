const apikey = 'bee469d4923cbd1da8e920bc690c2669';
const searchBtn = document.getElementById("search-btn");
const temperature = document.getElementById("temp");
const description = document.getElementById("description");
const windySpeed = document.getElementById("windy");
const humindity = document.getElementById("humindity");
const imaCur = document.getElementById("imgCur");

searchBtn.addEventListener("click", async event => {
    event.preventDefault();
    const city = document.getElementById("input").value;

    if (city) {
        try {
            const weatherData = await getWeatherData(city);
            displayWeatherData(weatherData);
        }
        catch (error) {
            alert(error);
        }
    }
});

function capitalizeWords(str) {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

async function getWeatherData(city) {
    const weatherApi = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apikey}`;
    

    const response = await fetch(weatherApi);
    // console.log(response);

    if (!response.ok) {
        throw new Error("Could not fetch weather data!");
    }

    return await response.json();
}
let temperatureChart = null;
function displayWeatherData(data) {
    //console.log(data);
    const dailyData = {};
    const timeList = [], tempList = [];
    data.list.forEach(item => {
        const [date, time] = item.dt_txt.split(" ");
        if (timeList.length < 10) {
            timeList.push(time.substring(0, 5));
            tempList.push(item.main.temp);
        }
        if (!dailyData[date] && item.dt_txt.includes("12:00:00")) {
            dailyData[date] = item;
        }
    });
    // console.log(timeList);
    // console.log(tempList);
    const forecastArray = Object.values(dailyData); 
    //console.log(forecastArray);
    temperature.textContent = forecastArray[0].main.temp;
    description.textContent = capitalizeWords(String (forecastArray[0].weather[0].description));
    windySpeed.textContent = forecastArray[0].wind.speed + "km/h";
    humindity.textContent = forecastArray[0].main.humidity + "%";
    let nameImg = forecastArray[0].weather[0].icon.substring(0, 2);
    imaCur.src = `images/${nameImg}d.png`;

    let i = 0;
    forecastArray.forEach(item => {
        const date = new Date(item.dt * 1000);
        const weekDay = date.toLocaleDateString('en-US', { weekday: 'long' });
        // console.log(weekDay);

        const img = document.getElementById(`img${i}`);
        const wday = document.getElementById(`wday${i}`);
        const wdayDescription = document.getElementById(`wday${i}-description`); 
        const dayTemp = document.getElementById(`day${i}Tem`);
        i++;

        nameImg = item.weather[0].icon.substring(0, 2);
        img.src = `images/${nameImg}d.png`;
        wday.textContent = weekDay;
        wdayDescription.textContent = capitalizeWords(String (item.weather[0].description));
        dayTemp.textContent = item.main.temp + "º";
    });

    const ctx = document.getElementById('temperatureChart').getContext('2d');
    if (temperatureChart) {
        temperatureChart.destroy();
    }
    temperatureChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeList,
            datasets: [{
                data: tempList,
                borderColor: 'orange',
                backgroundColor: 'rgba(255,255,255,0.1)',
                tension: 0.4,
                pointBackgroundColor: 'orange',
                pointBorderColor: 'white',
                pointRadius: 5,
                borderWidth: 1
            }]
        },
        plugins: [ChartDataLabels],
        options: {
            plugins: {
                legend: { display: false },
                datalabels: {
                    color: 'orange',
                    align: 'top',
                    font: {
                      weight: 'bold'
                    },
                    formatter: value => value + "º"
                  }
            },
            scales: {
                x: {
                    grid: { display: false }
                },
                y: {
                    ticks: { stepSize: 5 },
                    display: false,
                    min: Math.floor(Math.min(...tempList)) -1,
                    max: Math.ceil(Math.max(...tempList)) + 1
                }
            }
        }
    });
}