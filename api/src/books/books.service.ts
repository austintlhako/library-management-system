import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

export interface FindBooksQuery {
  genreId?: string;
  search?: string;
  page?: number | string;
  limit?: number | string;
}

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBookDto: CreateBookDto) {
    const existing = await this.prisma.book.findUnique({
      where: { isbn: createBookDto.isbn },
    });

    if (existing) {
      throw new ConflictException('A book with this ISBN already exists');
    }

    const genre = await this.prisma.genre.findUnique({
      where: { id: createBookDto.genreId },
    });

    if (!genre) {
      throw new NotFoundException(
        `Genre with ID "${createBookDto.genreId}" not found`,
      );
    }

    return this.prisma.book.create({
      data: {
        title: createBookDto.title,
        author: createBookDto.author,
        isbn: createBookDto.isbn,
        totalCopies: createBookDto.totalCopies,
        genreId: createBookDto.genreId,
        publishedAt: createBookDto.publishedAt
          ? new Date(createBookDto.publishedAt)
          : undefined,
      },
      include: {
        genre: true,
      },
    });
  }

  async findAll(query: FindBooksQuery = {}) {
    const { genreId, search, page, limit } = query;
    const where: Prisma.BookWhereInput = {};

    if (genreId) {
      where.genreId = genreId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
      ];
    }

    const pageNum = page ? Number(page) : undefined;
    const limitNum = limit ? Number(limit) : undefined;
    const skip = pageNum && limitNum ? (pageNum - 1) * limitNum : undefined;
    const take = limitNum ? limitNum : undefined;

    return this.prisma.book.findMany({
      where,
      skip,
      take,
      include: {
        genre: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: {
        genre: true,
      },
    });

    if (!book) {
      throw new NotFoundException(`Book with ID "${id}" not found`);
    }

    return book;
  }

  async update(id: string, updateBookDto: UpdateBookDto) {
    await this.findOne(id);

    if (updateBookDto.isbn) {
      const existing = await this.prisma.book.findUnique({
        where: { isbn: updateBookDto.isbn },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('A book with this ISBN already exists');
      }
    }

    if (updateBookDto.genreId) {
      const genre = await this.prisma.genre.findUnique({
        where: { id: updateBookDto.genreId },
      });

      if (!genre) {
        throw new NotFoundException(
          `Genre with ID "${updateBookDto.genreId}" not found`,
        );
      }
    }

    return this.prisma.book.update({
      where: { id },
      data: {
        ...updateBookDto,
        publishedAt: updateBookDto.publishedAt
          ? new Date(updateBookDto.publishedAt)
          : undefined,
      },
      include: {
        genre: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.book.delete({
      where: { id },
    });
  }
}

