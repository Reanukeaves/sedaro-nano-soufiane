import type { ReportHandler, Metric } from 'web-vitals';

const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    const logPerformance = (metric: Metric) => {
      
      const logMessage = `[${metric.name}] Value: ${metric.value.toFixed(2)}, Delta: ${metric.delta.toFixed(2)}, ID: ${metric.id}`;
      console.log(logMessage);

    
      onPerfEntry(metric);
    };

    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(logPerformance);
      getFID(logPerformance);
      getFCP(logPerformance);
      getLCP(logPerformance);
      getTTFB(logPerformance);
    });
  }
};

export default reportWebVitals;
