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

export const TOLOVLAR_PAGE = gql`
  query TolovlarPage {
    sales {
      id
      totalPriceUzs
      paidUzs
      debtUzs
      date
      saleType
      customerId
      payments {
        id
        amount
        currency
        exchangeRate
        amountUzs
        date
      }
    }
    customers {
      id
      name
    }
  }
`;

export const ADD_PAYMENT = gql`
  mutation AddPayment($input: AddPaymentInput!) {
    addPayment(input: $input) {
      id
      amountUzs
    }
  }
`;

export const MIJOZLAR_PAGE = gql`
  query MijozlarPage {
    customers {
      id
      name
      phone
      salesCount
      debtUzs
      createdAt
    }
  }
`;

export const CREATE_CUSTOMER = gql`
  mutation CreateCustomer($input: CreateCustomerInput!) {
    createCustomer(input: $input) {
      id
      name
    }
  }
`;

export const TEMPLATES_PAGE = gql`
  query TemplatesPage {
    productTemplates {
      id
      name
      length
      width
      thickness
      volumePerPiece
    }
  }
`;

export const CREATE_TEMPLATE = gql`
  mutation CreateTemplate($input: CreateProductTemplateInput!) {
    createProductTemplate(input: $input) {
      id
      name
      volumePerPiece
    }
  }
`;

export const PRODUCTION_PAGE = gql`
  query ProductionPage {
    productionBatches {
      id
      date
      inputVolumeM3
      outputQuantity
      outputVolumeM3
      yieldPercent
      outputProductId
    }
    productTemplates {
      id
      name
      volumePerPiece
    }
    inventory {
      id
      woodType
      grade
      source
      volumeM3Remaining
    }
  }
`;

export const CREATE_BATCH = gql`
  mutation CreateBatch($input: CreateProductionBatchInput!) {
    createProductionBatch(input: $input) {
      id
      yieldPercent
      outputVolumeM3
    }
  }
`;

export const FINISHED_GOODS = gql`
  query FinishedGoods {
    finishedGoods {
      id
      productName
      quantityRemaining
      unitCostUzsPerPiece
      createdAt
    }
  }
`;

export const TRANSFERS_PAGE = gql`
  query TransfersPage {
    transfers {
      id
      fromWorkspaceId
      toWorkspaceId
      lotId
      volumeM3
      internalPriceUzs
      date
    }
    inventory {
      id
      woodType
      grade
      source
      volumeM3Remaining
    }
  }
`;

export const CREATE_TRANSFER = gql`
  mutation CreateTransfer($input: CreateTransferInput!) {
    createTransfer(input: $input) {
      id
      volumeM3
      internalPriceUzs
    }
  }
`;

export const ISHCHILAR_PAGE = gql`
  query IshchilarPage {
    employees {
      id
      workspaceId
      name
      phone
      position
      salaryAmount
      salaryType
      createdAt
    }
  }
`;

export const CREATE_EMPLOYEE = gql`
  mutation CreateEmployee($input: CreateEmployeeInput!) {
    createEmployee(input: $input) {
      id
      name
    }
  }
`;

export const PAY_SALARY = gql`
  mutation PaySalary($input: PaySalaryInput!) {
    paySalary(input: $input) {
      id
      amountUzs
      period
    }
  }
`;

export const CONSOLIDATED_REPORT = gql`
  query ConsolidatedReport {
    consolidatedReport {
      workspaces {
        workspaceId
        name
        type
        salesUzs
        transferInUzs
        soldCostUzs
        expensesUzs
        netProfitUzs
      }
      totalSalesUzs
      totalExpensesUzs
      totalNetProfitUzs
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
