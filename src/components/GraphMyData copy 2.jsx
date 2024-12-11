import React, { useState, useEffect } from 'react';
import { basic_API_url } from './global_const.js';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import PropTypes from 'prop-types';

// Register Chart.js modules
ChartJS.register(BarElement, CategoryScale, LinearScale, Legend);

async function getData(username, apikey, startDate, endDate) {
  const postData = new FormData();
  const fetchURL = basic_API_url() + 'php/mebyme.php';

  postData.append('username', username);
  postData.append('apikey', apikey);
  postData.append('startDate', startDate);
  postData.append('endDate', endDate);
  postData.append('action', 'get_hgh_day_summary');

  const requestOptions = {
    method: 'POST',
    body: postData,
  };

  try {
    const res = await fetch(fetchURL, requestOptions);
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

function GraphMyData({ startDate, endDate, username, apikey }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const data = await getData(username, apikey, startDate, endDate);

        let dayData = data.groupedData;
        const labels = dayData[0]?.data.map(item => item.datum);

        // Define dataset colors
        const colors = [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 205, 86, 0.6)',
        ];

        const datasets = dayData.map((aspect, index) => ({
          label: aspect.aspect_type,
          data: aspect.data.map(item => item.max),
          backgroundColor: colors[index % colors.length],
          borderColor: colors[index % colors.length].replace('0.6', '1'),
          borderWidth: 1,
        }));

        setChartData({
          labels,
          datasets,
        });
      } catch (err) {
        setError('Failed to load data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [startDate, endDate, username, apikey]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return chartData ? (
    <div>
     <Bar
      data={chartData}
      options={{
        responsive: true,
        plugins: {
          legend: {
            display: true, // Zorg dat de legend zichtbaar is
            position: 'top', // Plaats de legend bovenaan
            labels: {
              usePointStyle: true, // Gebruik ronde punten in de legend
              boxWidth: 20, // Grootte van de legend-iconen
              padding: 15, // Afstand tussen de legend-items
            },
            onClick: (e, legendItem) => {
              const chart = e.chart;
              const index = legendItem.datasetIndex; // Index van aangeklikte dataset
              const meta = chart.getDatasetMeta(index);

              // Zet de zichtbaarheid van de dataset aan/uit
              meta.hidden = meta.hidden === null ? !chart.data.datasets[index].hidden : null;
              chart.update(); // Update de grafiek om de wijziging door te voeren
            },
          },
        },
        interaction: {
          mode: 'index', // Interactie per index
          intersect: false, // Zorg dat interactie werkt over alle datasets
        },
        scales: {
          x: {
            type: 'category',
            labels: chartData?.labels || [], // Labels voor de x-as (datums)
          },
          y: {
            min: 0, // Zorg dat de y-as begint bij 0
          },
        },
      }}
      onElementsClick={(elems) => {
        if (elems.length > 0) {
          console.log(elems); // Controleer welke elementen er worden aangeklikt
        }
      }}
    />
    </div>
  ) : (
    <p>No data available.</p>
  );
}

GraphMyData.propTypes = {
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  apikey: PropTypes.string.isRequired,
};

export default GraphMyData;