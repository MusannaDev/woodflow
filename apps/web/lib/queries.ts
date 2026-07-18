import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      userId
      name
      workspaces {
        id
        name
        type
        role
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      userId
      name
      workspaces {
        id
        name
        type
        role
      }
    }
  }
`;

export const SALES_PAGE = gql`
  query SalesPage {
    customers {
      id
      name
    }
    inventory {
      id
      woodType
      grade
      source
      volumeM3Remaining
    }
    sales {
      id
      totalPriceUzs
      paidUzs
      debtUzs
      date
      saleType
      items {
        volumeM3
        quantity
      }
    }
  }
`;

export const CREATE_SALE = gql`
  mutation CreateSale($input: CreateSaleInput!) {
    createSale(input: $input) {
      id
      totalPriceUzs
      debtUzs
    }
  }
`;

export const INVENTORY_PAGE = gql`
  query InventoryPage {
    inventorySummary {
      totalRemainingM3
      defectM3
      lotCount
    }
    inventory {
      id
      woodType
      grade
      source
      status
      volumeM3Remaining
      unitCostUzsPerM3
    }
  }
`;

export const RECORD_DEFECT = gql`
  mutation RecordDefect($input: RecordDefectInput!) {
    recordDefect(input: $input) {
      id
      volumeM3
    }
  }
`;

export const EXPENSES_PAGE = gql`
  query ExpensesPage {
    expenses {
      id
      workspaceId
      category
      amountUzs
      date
      description
    }
  }
`;

export const CREATE_EXPENSE = gql`
  mutation CreateExpense($input: CreateExpenseInput!) {
    createExpense(input: $input) {
      id
      category
      amountUzs
    }
  }
`;

export const SHIPMENTS_PAGE = gql`
  query ShipmentsPage {
    shipments {
      id
      truckNumber
      truckColor
      ownerName
      ownerPhone
      arrivalDate
      transportCost
      customsCost
    }
  }
`;

export const SHIPMENT_PNL = gql`
  query ShipmentPnl($shipmentId: String!) {
    shipmentPnl(shipmentId: $shipmentId) {
      shipmentId
      truckNumber
      salesUzs
      soldCostUzs
      transportUzs
      customsUzs
      defectLossUzs
      netProfitUzs
      soldVolumeM3
      defectVolumeM3
    }
  }
`;

export const CREATE_SHIPMENT = gql`
  mutation CreateShipment($input: CreateShipmentInput!) {
    createShipment(input: $input) {
      id
      truckNumber
    }
  }
`;

export const DASHBOARD = gql`
  query Dashboard {
    sales {
      id
      totalPriceUzs
      paidUzs
      debtUzs
      date
      saleType
    }
    inventory {
      id
      woodType
      grade
      source
      volumeM3Remaining
      unitCostUzsPerM3
    }
    customers {
      id
      name
      debtUzs
    }
  }
`;
