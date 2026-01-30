import { hashPassword, generateBarcode } from '../src/utils/helpers';
import { UserRole, BookStatus } from '../src/types';
import sequelize from '../src/config/database';

async function seed() {
  console.log('Starting database seed...');

  await sequelize.sync({ force: true });
  console.log('Database synced');

  const { User, Author, Publisher, Category, Library, Book, BookCopy } = await import('../src/models');

  const library = await Library.create({
    name: 'Main Library',
    code: 'MAIN',
    address: '123 Library Street',
    city: 'Booktown',
    phone: '+1-555-0100',
    email: 'main@library.local',
    isMain: true,
    isActive: true,
  });
  console.log('Created library:', library.name);

  const adminPassword = await hashPassword('Admin123!');
  const librarianPassword = await hashPassword('Librarian123!');
  const memberPassword = await hashPassword('Member123!');

  const admin = await User.create({
    email: 'admin@library.local',
    password: adminPassword,
    firstName: 'System',
    lastName: 'Admin',
    role: UserRole.ADMIN,
    isActive: true,
    isEmailVerified: true,
    libraryId: library.id,
  });
  console.log('Created admin user:', admin.email);

  const librarian = await User.create({
    email: 'librarian@library.local',
    password: librarianPassword,
    firstName: 'John',
    lastName: 'Librarian',
    role: UserRole.LIBRARIAN,
    isActive: true,
    isEmailVerified: true,
    libraryId: library.id,
  });
  console.log('Created librarian user:', librarian.email);

  const member = await User.create({
    email: 'member@library.local',
    password: memberPassword,
    firstName: 'Jane',
    lastName: 'Reader',
    role: UserRole.MEMBER,
    isActive: true,
    isEmailVerified: true,
    libraryId: library.id,
  });
  console.log('Created member user:', member.email);

  const categories = await Category.bulkCreate([
    { name: 'Fiction', description: 'Fictional works including novels and short stories' },
    { name: 'Non-Fiction', description: 'Factual books and educational content' },
    { name: 'Science', description: 'Scientific texts and research' },
    { name: 'Technology', description: 'Computer science and technology books' },
    { name: 'History', description: 'Historical accounts and biographies' },
    { name: 'Philosophy', description: 'Philosophical texts and ethics' },
    { name: 'Children', description: 'Books for children and young readers' },
    { name: 'Reference', description: 'Dictionaries, encyclopedias, and reference materials' },
  ]);
  console.log('Created categories:', categories.length);

  const authors = await Author.bulkCreate([
    { name: 'George Orwell', biography: 'English novelist and essayist', nationality: 'British' },
    { name: 'Jane Austen', biography: 'English novelist known for romantic fiction', nationality: 'British' },
    { name: 'Ernest Hemingway', biography: 'American novelist and journalist', nationality: 'American' },
    { name: 'Virginia Woolf', biography: 'English writer and modernist', nationality: 'British' },
    { name: 'Mark Twain', biography: 'American writer and humorist', nationality: 'American' },
    { name: 'Charles Dickens', biography: 'English writer of the Victorian era', nationality: 'British' },
    { name: 'F. Scott Fitzgerald', biography: 'American novelist of the Jazz Age', nationality: 'American' },
    { name: 'Harper Lee', biography: 'American novelist', nationality: 'American' },
  ]);
  console.log('Created authors:', authors.length);

  const publishers = await Publisher.bulkCreate([
    { name: 'Penguin Random House', website: 'https://www.penguinrandomhouse.com' },
    { name: 'HarperCollins', website: 'https://www.harpercollins.com' },
    { name: 'Simon & Schuster', website: 'https://www.simonandschuster.com' },
    { name: 'Macmillan Publishers', website: 'https://us.macmillan.com' },
    { name: 'Oxford University Press', website: 'https://global.oup.com' },
  ]);
  console.log('Created publishers:', publishers.length);

  const booksData = [
    {
      isbn: '9780451524935',
      title: '1984',
      description: 'A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism.',
      publishedYear: 1949,
      language: 'English',
      pageCount: 328,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg',
      authorId: authors[0]!.id,
      categoryId: categories[0]!.id,
      publisherId: publishers[0]!.id,
    },
    {
      isbn: '9780141439518',
      title: 'Pride and Prejudice',
      description: 'A romantic novel following the character development of Elizabeth Bennet.',
      publishedYear: 1813,
      language: 'English',
      pageCount: 432,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg',
      authorId: authors[1]!.id,
      categoryId: categories[0]!.id,
      publisherId: publishers[0]!.id,
    },
    {
      isbn: '9780684801223',
      title: 'The Old Man and the Sea',
      description: 'A short novel about an aging Cuban fisherman and his struggle with a giant marlin.',
      publishedYear: 1952,
      language: 'English',
      pageCount: 127,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780684801223-L.jpg',
      authorId: authors[2]!.id,
      categoryId: categories[0]!.id,
      publisherId: publishers[2]!.id,
    },
    {
      isbn: '9780156907392',
      title: 'To the Lighthouse',
      description: 'A landmark novel of high modernism centered on the Ramsay family.',
      publishedYear: 1927,
      language: 'English',
      pageCount: 209,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780156907392-L.jpg',
      authorId: authors[3]!.id,
      categoryId: categories[0]!.id,
      publisherId: publishers[3]!.id,
    },
    {
      isbn: '9780486280615',
      title: 'Adventures of Huckleberry Finn',
      description: 'A novel about a young boy and a runaway slave floating down the Mississippi River.',
      publishedYear: 1884,
      language: 'English',
      pageCount: 366,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780486280615-L.jpg',
      authorId: authors[4]!.id,
      categoryId: categories[0]!.id,
      publisherId: publishers[0]!.id,
    },
    {
      isbn: '9780141439563',
      title: 'Great Expectations',
      description: 'The story of the orphan Pip, writing his life from his early days.',
      publishedYear: 1861,
      language: 'English',
      pageCount: 544,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780141439563-L.jpg',
      authorId: authors[5]!.id,
      categoryId: categories[0]!.id,
      publisherId: publishers[0]!.id,
    },
    {
      isbn: '9780743273565',
      title: 'The Great Gatsby',
      description: 'A novel about the American Dream set in the Jazz Age.',
      publishedYear: 1925,
      language: 'English',
      pageCount: 180,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg',
      authorId: authors[6]!.id,
      categoryId: categories[0]!.id,
      publisherId: publishers[2]!.id,
    },
    {
      isbn: '9780061120084',
      title: 'To Kill a Mockingbird',
      description: 'A novel about racial injustice in the American South.',
      publishedYear: 1960,
      language: 'English',
      pageCount: 336,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg',
      authorId: authors[7]!.id,
      categoryId: categories[0]!.id,
      publisherId: publishers[1]!.id,
    },
    {
      isbn: '9780452284234',
      title: 'Animal Farm',
      description: 'An allegorical novella reflecting events leading up to the Russian Revolution.',
      publishedYear: 1945,
      language: 'English',
      pageCount: 112,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780452284234-L.jpg',
      authorId: authors[0]!.id,
      categoryId: categories[0]!.id,
      publisherId: publishers[0]!.id,
    },
    {
      isbn: '9780141182636',
      title: 'A Tale of Two Cities',
      description: 'A historical novel set in London and Paris before and during the French Revolution.',
      publishedYear: 1859,
      language: 'English',
      pageCount: 489,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780141182636-L.jpg',
      authorId: authors[5]!.id,
      categoryId: categories[0]!.id,
      publisherId: publishers[0]!.id,
    },
  ];

  const books = await Book.bulkCreate(booksData);
  console.log('Created books:', books.length);

  const bookCopiesData: Array<{
    bookId: string;
    barcode: string;
    status: BookStatus;
    condition: 'new' | 'good' | 'fair' | 'poor';
    location: string;
    libraryId: string;
  }> = [];

  for (const book of books) {
    const copyCount = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < copyCount; i++) {
      bookCopiesData.push({
        bookId: book.id,
        barcode: generateBarcode(),
        status: BookStatus.AVAILABLE,
        condition: 'good',
        location: `Shelf ${String.fromCharCode(65 + Math.floor(Math.random() * 6))}-${Math.floor(Math.random() * 10) + 1}`,
        libraryId: library.id,
      });
    }
  }

  const bookCopies = await BookCopy.bulkCreate(bookCopiesData);
  console.log('Created book copies:', bookCopies.length);

  console.log('\n=== Seed Complete ===');
  console.log('Test accounts created:');
  console.log('  Admin:     admin@library.local / Admin123!');
  console.log('  Librarian: librarian@library.local / Librarian123!');
  console.log('  Member:    member@library.local / Member123!');
  console.log('\nBooks seeded:', books.length);
  console.log('Book copies created:', bookCopies.length);

  await sequelize.close();
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
