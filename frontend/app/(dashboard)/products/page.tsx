"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import type { Product } from "@/app/types/types.utils";
import { institutionAPI } from "@/lib/api-helpers";
import { ICallCenterProduct } from "@/app/types/api.types";

// Mock data
// const mockProducts: Product[] = [
//   {
//     id: "1",
//     name: "Valuation",
//     description: "Determining the worth of an asset or business.",
//     companies: 23,
//     contacts: 213,
//     status: "Active",
//     customFields: [],
//   },
//   {
//     id: "2",
//     name: "Loan",
//     description: "Money borrowed that must be paid back.",
//     companies: 23,
//     contacts: 213,
//     status: "Active",
//     customFields: [],
//   },
//   {
//     id: "3",
//     name: "Investment",
//     description: "Putting money into assets expecting returns.",
//     companies: 0,
//     contacts: 0,
//     status: "Inactive",
//     customFields: [],
//   },
// ];

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ICallCenterProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    handleFetchProducts();
  }, []);

  const handleFetchProducts = async () => {
    try {
      const fetchedProducts = await institutionAPI.getProductsByInstitution({
        institutionId: 1,
      });
      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.descriptions.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalProducts = filteredProducts.length;

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-white rounded-xl p-4">
      {/* <div className="space-y-6  pt-12"> */}
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={handleBack} className="h-8 w-8 p-0 !aspect-square !rounded-full">
            <Icon icon="hugeicons:arrow-left-02" className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-semibold">Products ({totalProducts})</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Icon
              icon="hugeicons:search-01"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
            />
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button
            onClick={() => router.push("/products/add")}
            className="bg-purple-600 hover:bg-purple-700 text-white h-10 w-10 p-0 rounded-full"
          >
            <Icon icon="hugeicons:add-01" className="w-4 h-4 !fill-white" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="text-left p-4 font-medium text-gray-700">Name</th>
                <th className="text-left p-4 font-medium text-gray-700">Description</th>
                <th className="text-left p-4 font-medium text-gray-700">Companies</th>
                <th className="text-left p-4 font-medium text-gray-700">Contacts</th>
                <th className="text-left p-4 font-medium text-gray-700">Status</th>
                <th className="text-left p-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.uuid} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{product.name}</td>
                  <td className="p-4 text-gray-600">{product.descriptions}</td>
                  <td className="p-4">{product?.companies || "None"}</td>
                  <td className="p-4">{product?.contacts || "None"}</td>
                  <td className="p-4">
                    <Badge
                      variant={product.status === "active" ? "default" : "secondary"}
                      className={
                        product.status === "active"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-red-100 text-red-800 hover:bg-red-100"
                      }
                    >
                      {product.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Icon icon="hugeicons:edit-02" className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Icon icon="hugeicons:delete-02" className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <p className="text-sm text-gray-600">
          Showing 1-{Math.min(7, totalProducts)} of {totalProducts}
        </p>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="default" size="sm" className="bg-purple-600 hover:bg-purple-700">
            1
          </Button>
          <Button variant="outline" size="sm">
            2
          </Button>
          <Button variant="outline" size="sm">
            3
          </Button>
          <span className="text-sm text-gray-500">...</span>
          <Button variant="outline" size="sm">
            5
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
      {/* </div> */}
    </div>
  );
}
