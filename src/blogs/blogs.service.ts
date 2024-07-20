import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from './blog.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { User } from '../users/user.entity';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private blogsRepository: Repository<Blog>,
  ) {}

  async create(createBlogDto: CreateBlogDto, user: User): Promise<Blog> {
    const blog = this.blogsRepository.create({
      ...createBlogDto,
      author: user.username,
    });
    return this.blogsRepository.save(blog);
  }
}
