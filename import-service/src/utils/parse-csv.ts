import csv from 'csv-parser';

export const parseCsvStream = async (stream: NodeJS.ReadableStream) => {
  const csvResult = [];
  return new Promise<any[]>((resolve, reject) => {
    stream
      .pipe(csv())
      .on('data', (data) => {
        console.log('data', data);
        csvResult.push(data);
      })
      .on('end', () => {
        console.log('end', csvResult);
        resolve(csvResult);
      })
      .on('error', (error) => {
        console.log('error', error);
        reject(error);
      });
  });
}