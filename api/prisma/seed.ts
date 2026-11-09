import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.book.deleteMany({});
  await prisma.genre.deleteMany({});
  await prisma.user.deleteMany({});

  // Seed Users
  await prisma.user.createMany({
    data: [
      {
        name: 'Admin Librarian',
        email: 'librarian@library.org',
        role: Role.LIBRARIAN,
      },
      { name: 'John Doe', email: 'john@example.com', role: Role.PATRON },
    ],
  });

  // Seed Genres
  const genres = await Promise.all([
    prisma.genre.create({ data: { name: 'Science Fiction' } }),
    prisma.genre.create({ data: { name: 'Fantasy' } }),
    prisma.genre.create({ data: { name: 'Mystery' } }),
    prisma.genre.create({ data: { name: 'Non-Fiction' } }),
  ]);

  const [sciFi, fantasy, mystery, nonFiction] = genres;

  // Seed 15+ Books distributed across genres
  const booksData = [
    // Science Fiction
    {
      title: 'Dune',
      author: 'Frank Herbert',
      isbn: '9780441172719',
      publishedAt: new Date('1965-08-01'),
      genreId: sciFi.id,
    },
    {
      title: 'Neuromancer',
      author: 'William Gibson',
      isbn: '9780441569564',
      publishedAt: new Date('1984-07-01'),
      genreId: sciFi.id,
    },
    {
      title: 'Foundation',
      author: 'Isaac Asimov',
      isbn: '9780553293357',
      publishedAt: new Date('1951-06-01'),
      genreId: sciFi.id,
    },
    {
      title: 'Snow Crash',
      author: 'Neal Stephenson',
      isbn: '9780553380958',
      publishedAt: new Date('1992-06-01'),
      genreId: sciFi.id,
    },

    // Fantasy
    {
      title: 'The Hobbit',
      author: 'J.R.R. Tolkien',
      isbn: '9780547928227',
      publishedAt: new Date('1937-09-21'),
      genreId: fantasy.id,
    },
    {
      title: 'A Game of Thrones',
      author: 'George R.R. Martin',
      isbn: '9780553103540',
      publishedAt: new Date('1996-08-01'),
      genreId: fantasy.id,
    },
    {
      title: 'The Name of the Wind',
      author: 'Patrick Rothfuss',
      isbn: '9780756404741',
      publishedAt: new Date('2007-03-27'),
      genreId: fantasy.id,
    },
    {
      title: 'The Way of Kings',
      author: 'Brandon Sanderson',
      isbn: '9780765326355',
      publishedAt: new Date('2010-08-31'),
      genreId: fantasy.id,
    },

    // Mystery
    {
      title: 'And Then There Were None',
      author: 'Agatha Christie',
      isbn: '9780062073488',
      publishedAt: new Date('1939-11-06'),
      genreId: mystery.id,
    },
    {
      title: 'The Girl with the Dragon Tattoo',
      author: 'Stieg Larsson',
      isbn: '9780307269751',
      publishedAt: new Date('2005-08-01'),
      genreId: mystery.id,
    },
    {
      title: 'The Da Vinci Code',
      author: 'Dan Brown',
      isbn: '9780307474278',
      publishedAt: new Date('2003-03-18'),
      genreId: mystery.id,
    },
    {
      title: 'Gone Girl',
      author: 'Gillian Flynn',
      isbn: '9780307588371',
      publishedAt: new Date('2012-06-05'),
      genreId: mystery.id,
    },

    // Non-Fiction
    {
      title: 'Sapiens: A Brief History of Humankind',
      author: 'Yuval Noah Harari',
      isbn: '9780062316097',
      publishedAt: new Date('2014-09-04'),
      genreId: nonFiction.id,
    },
    {
      title: 'Educated',
      author: 'Tara Westover',
      isbn: '9780399590504',
      publishedAt: new Date('2018-02-20'),
      genreId: nonFiction.id,
    },
    {
      title: 'Atomic Habits',
      author: 'James Clear',
      isbn: '9780735211292',
      publishedAt: new Date('2018-10-16'),
      genreId: nonFiction.id,
    },
    {
      title: 'Becoming',
      author: 'Michelle Obama',
      isbn: '9781524763138',
      publishedAt: new Date('2018-11-13'),
      genreId: nonFiction.id,
    },
  ];

  for (const book of booksData) {
    await prisma.book.create({ data: book });
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
