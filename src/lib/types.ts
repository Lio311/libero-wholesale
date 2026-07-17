import { InferSelectModel } from 'drizzle-orm';
import { products } from './db/schema';

export type Product = InferSelectModel<typeof products>;
