"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Icon } from "@iconify/react"
import type { IContact, ICallCenterProduct } from "@/app/types/api.types"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ContactsFiltersProps {
  viewMode: "list" | "grid"
  onViewModeChange: (mode: "list" | "grid") => void
  activeContactsCount: number
  archivedContactsCount: number
  contacts: IContact[]
  products: ICallCenterProduct[]
  onFilteredContactsChange: (filteredContacts: IContact[]) => void
}

export function ContactsFilters({
  viewMode,
  onViewModeChange,
  activeContactsCount,
  archivedContactsCount,
  contacts,
  products,
  onFilteredContactsChange,
}: ContactsFiltersProps) {
  const [activeFilter, setActiveFilter] = useState<"active" | "archived">("active")
  const [selectedProductId, setSelectedProductId] = useState<string | "all">("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    filterContacts()
  }, [activeFilter, selectedProductId, searchTerm, contacts])

  const filterContacts = () => {
    let filtered = contacts

    // Filter by status (active/archived)
    if (activeFilter === "active") {
      filtered = filtered.filter((contact) => contact.status !== "archived")
    } else {
      filtered = filtered.filter((contact) => contact.status === "archived")
    }

    // Filter by product
    if (selectedProductId !== "all") {
      filtered = filtered.filter((contact) => contact.product.uuid === selectedProductId)
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (contact) =>
          contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.phone_number.includes(searchTerm) ||
          contact.product.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    onFilteredContactsChange(filtered)
  }

  const handleStatusFilterChange = (filter: "active" | "archived") => {
    setActiveFilter(filter)
  }

  const handleProductFilterChange = (productId: string | "all") => {
    setSelectedProductId(productId)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      {/* Search Bar */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Icon
            icon="hugeicons:search-01"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
          />
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
      </div>

      {/* Product Tabs */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Filter by Product</h3>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-2 pb-2">
            <Button
              variant={selectedProductId === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => handleProductFilterChange("all")}
              className="rounded-full shrink-0"
            >
              All Products
            </Button>
            {products.map((product) => (
              <Button
                key={product.uuid}
                variant={selectedProductId === product.uuid ? "default" : "outline"}
                size="sm"
                onClick={() => handleProductFilterChange(product.uuid)}
                className="rounded-full shrink-0"
              >
                {product.name}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Status and View Mode Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant={activeFilter === "active" ? "outline" : "ghost"}
            className={`rounded-xl ${activeFilter === "active" ? "border-primary-200 text-primary-700 bg-primary-50" : ""}`}
            onClick={() => handleStatusFilterChange("active")}
          >
            Active Contacts ({activeContactsCount})
          </Button>
          <Button
            variant={activeFilter === "archived" ? "outline" : "ghost"}
            className={`rounded-xl ${activeFilter === "archived" ? "border-orange-200 text-orange-700 bg-orange-50" : ""}`}
            onClick={() => handleStatusFilterChange("archived")}
          >
            Archived ({archivedContactsCount})
          </Button>
        </div>

        <div className="flex items-center bg-gray-100 rounded-xl p-1">
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("list")}
            className="rounded-lg"
          >
            <Icon icon="hugeicons:menu-01" className="w-4 h-4" />
            List
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("grid")}
            className="rounded-lg"
          >
            <Icon icon="hugeicons:grid-view" className="w-4 h-4" />
            Grid
          </Button>
        </div>
      </div>
    </div>
  )
}
