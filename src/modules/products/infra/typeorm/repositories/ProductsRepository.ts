import { getRepository, Repository } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = await this.ormRepository.findOne({ name });
    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const ids = products.map(product => product.id);

    const productsFounded = await this.ormRepository.findByIds(ids);

    return productsFounded;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const ids: IFindProducts[] = products.map(product => ({ id: product.id }));

    const productsfounded = await this.findAllById(ids);

    for (let index = 0; index < productsfounded.length; index++) {
      const product = productsfounded[index];
      const dataToUpdate = products[index];

      if (dataToUpdate) {
        product.quantity = dataToUpdate.quantity;
      }
    }

    await this.ormRepository.save(productsfounded);
    return productsfounded;
  }
}

export default ProductsRepository;
