import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<any> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer does not exists!');
    }

    const productsFounded = await this.productsRepository.findAllById(products);

    const checkHasAllProductsRequested = productsFounded.filter(({ id }) =>
      products.find(product => product.id === id),
    );

    if (checkHasAllProductsRequested.length !== products.length) {
      throw new AppError('Some product invalid!');
    }

    const checkProductDontHasQuantity = productsFounded.some(product => {
      const productRequested = products.find(({ id }) => product.id === id);
      if (!productRequested) {
        return false;
      }
      return productRequested.quantity > product.quantity;
    });

    if (checkProductDontHasQuantity) {
      throw new AppError('roducts with insufficient quantities!');
    }

    const productsToAdd: {
      product_id: string;
      price: number;
      quantity: number;
    }[] = [];

    productsFounded.forEach(product => {
      const productInfo = products.find(({ id }) => product.id === id);

      if (productInfo) {
        productsToAdd.push({
          product_id: product.id,
          price: product.price,
          quantity: productInfo.quantity,
        });
      }
    });

    const order = await this.ordersRepository.create({
      customer,
      products: productsToAdd,
    });

    await this.productsRepository.updateQuantity(
      productsFounded.map(productFound => {
        const product = productsToAdd.find(
          ({ product_id }) => product_id === productFound.id,
        );
        return {
          id: productFound.id,
          quantity: productFound.quantity - (product?.quantity || 0),
        };
      }),
    );

    return {
      ...order,
      order_products: order.order_products.map(product => ({
        ...product,
        price: product.price.toFixed(2),
      })),
    };
  }
}

export default CreateOrderService;
