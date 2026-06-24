import { productsRepository } from "./products.repository";
import { getPagination, buildPaginationMeta } from "../../../utils/pagination";
import { ApiError } from "../../../utils/ApiError";
import { signImageFields, normalizeStoragePathFields } from "../../../config/storage";
import prisma from "../../../config/prisma";

const MEDIA_FIELDS = ["images", "videos"];

interface ProductQuery {
  page?: string;
  limit?: string;
  categorySlug?: string;
  supplierId?: string;
  search?: string;
}

// Helper function to resolve category and subcategory names, and sanitize categoryId
async function resolveProductCategory(data: Record<string, any>) {
  const categoryName = data.category as string | undefined;
  const subcategoryName = data.subcategory as string | undefined;

  // Delete frontend string fields so they are not passed to Prisma
  delete data.category;
  delete data.subcategory;

  if (subcategoryName && subcategoryName.trim() !== "") {
    let parentId: string | null = null;
    if (categoryName && categoryName.trim() !== "") {
      let parentCategory = await prisma.productCategory.findFirst({
        where: {
          name: { equals: categoryName.trim(), mode: "insensitive" },
          parentId: null,
        },
      });
      if (!parentCategory) {
        parentCategory = await prisma.productCategory.create({
          data: {
            name: categoryName.trim(),
            slug: categoryName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
          },
        });
      }
      parentId = parentCategory.id;
    }

    let subCategory = await prisma.productCategory.findFirst({
      where: {
        name: { equals: subcategoryName.trim(), mode: "insensitive" },
        parentId: parentId,
      },
    });
    if (!subCategory) {
      subCategory = await prisma.productCategory.create({
        data: {
          name: subcategoryName.trim(),
          slug: subcategoryName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
          parentId: parentId,
        },
      });
    }
    data.categoryId = subCategory.id;
  } else if (categoryName && categoryName.trim() !== "") {
    let category = await prisma.productCategory.findFirst({
      where: {
        name: { equals: categoryName.trim(), mode: "insensitive" },
        parentId: null,
      },
    });
    if (!category) {
      category = await prisma.productCategory.create({
        data: {
          name: categoryName.trim(),
          slug: categoryName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        },
      });
    }
    data.categoryId = category.id;
  }

  // Validate if categoryId is a valid UUID, otherwise nullify it
  if (data.categoryId) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(data.categoryId as string)) {
      data.categoryId = null;
    }
  }
}

export const productsService = {
  async getProducts(query: ProductQuery) {
    const { page, limit, skip, take } = getPagination(query);

    const [products, total] = await productsRepository.findAll({
      categorySlug: query.categorySlug,
      supplierId: query.supplierId,
      search: query.search,
      skip,
      take,
    });

    const pagination = buildPaginationMeta(total, page, limit);
    // Convert storage-path media to signed read URLs (legacy base64/external pass through).
    await signImageFields(products, { arrays: MEDIA_FIELDS });
    return { products, pagination };
  },

  async getProductById(id: string) {
    const product = await productsRepository.findById(id);
    await signImageFields(product, { arrays: MEDIA_FIELDS });
    return product;
  },

  async createProduct(data: Record<string, unknown>) {
    // Auto-generate slug from name if not provided
    if (!data.slug && data.name) {
      data.slug = (data.name as string)
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    }
    // Resolve category names and sanitize categoryId
    await resolveProductCategory(data);

    // An admin form may resubmit signed URLs it was shown — store raw paths only.
    normalizeStoragePathFields(data, MEDIA_FIELDS);
    return productsRepository.create(data);
  },

  async updateProduct(id: string, data: Record<string, unknown>) {
    const existing = await productsRepository.findById(id).catch(() => null);
    if (!existing) {
      throw ApiError.notFound("Product not found");
    }
    // Resolve category names and sanitize categoryId
    await resolveProductCategory(data);

    normalizeStoragePathFields(data, MEDIA_FIELDS);
    return productsRepository.update(id, data);
  },

  async deleteProduct(id: string) {
    const existing = await productsRepository.findById(id).catch(() => null);
    if (!existing) {
      throw ApiError.notFound("Product not found");
    }
    return productsRepository.softDelete(id);
  },
};
