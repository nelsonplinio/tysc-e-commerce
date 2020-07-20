import { getRepository, Repository } from 'typeorm';

import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import ICreateCustomerDTO from '@modules/customers/dtos/ICreateCustomerDTO';
import Customer from '../entities/Customer';

class CustomersRepository implements ICustomersRepository {
  private ormRepository: Repository<Customer>;

  constructor() {
    this.ormRepository = getRepository(Customer);
  }

  public async create({ name, email }: ICreateCustomerDTO): Promise<Customer> {
    const customer = this.ormRepository.create({
      name,
      email,
    });

    await this.ormRepository.save(customer);

    delete customer.created_at;
    delete customer.updated_at;

    return customer;
  }

  public async findById(id: string): Promise<Customer | undefined> {
    const findCustomer = await this.ormRepository.findOne(id);

    delete findCustomer?.created_at;
    delete findCustomer?.updated_at;

    return findCustomer;
  }

  public async findByEmail(email: string): Promise<Customer | undefined> {
    const findCustomer = await this.ormRepository.findOne({
      where: {
        email,
      },
    });

    delete findCustomer?.created_at;
    delete findCustomer?.updated_at;

    return findCustomer;
  }
}

export default CustomersRepository;
