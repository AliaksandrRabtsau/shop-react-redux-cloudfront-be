export interface IProduct {
  id: number | string,
  title: string,
	price: number | string,
	imgLink?: string,
	count?: number | string,
  description: string, 
}

export interface IStock {
  product_id: string,
  count: number,
}