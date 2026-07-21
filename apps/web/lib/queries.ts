import { gql } from '@apollo/client';

const AUTH_FIELDS = `
  token
  userId
  name
  platformRole
  pending
  workspaces {
    id
    name
    type
    role
  }
  business {
    id
    name
    logoUrl
    status
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) { ${AUTH_FIELDS} }
  }
`;

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) { ${AUTH_FIELDS} }
  }
`;

export const MY_AUTH = gql`
  query MyAuth {
    myAuth { ${AUTH_FIELDS} }
  }
`;

export const PENDING_OWNER_REQUESTS = gql`
  query PendingOwnerRequests {
    pendingOwnerRequests {
      id
      userName
      userPhone
      businessName
      createdAt
    }
  }
`;

export const DECIDE_OWNER_REQUEST = gql`
  mutation DecideOwnerRequest($input: DecideRequestInput!) {
    decideOwnerRequest(input: $input) {
      id
      status
    }
  }
`;

export const PENDING_WORKER_REQUESTS = gql`
  query PendingWorkerRequests {
    pendingWorkerRequests {
      id
      userName
      userPhone
      employeeName
      createdAt
    }
  }
`;

export const DECIDE_WORKER_REQUEST = gql`
  mutation DecideWorkerRequest($input: DecideRequestInput!) {
    decideWorkerRequest(input: $input) {
      id
      status
    }
  }
`;

export const MY_BUSINESS = gql`
  query MyBusiness {
    myBusiness {
      id
      name
      logoUrl
      status
    }
  }
`;

export const UPDATE_BUSINESS = gql`
  mutation UpdateBusiness($input: UpdateBusinessInput!) {
    updateBusiness(input: $input) {
      id
      name
      logoUrl
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
      quantityRemaining
    }
    finishedGoods {
      id
      productName
      quantityRemaining
      unitCostUzsPerPiece
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
      totalQuantity
      lotCount
    }
    inventory {
      id
      woodType
      grade
      source
      status
      volumeM3Remaining
      quantityRemaining
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
      quantity
      internalPriceUzs
      date
    }
    inventory {
      id
      woodType
      grade
      source
      volumeM3Remaining
      quantityRemaining
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

export const KIRIM_PAGE = gql`
  query KirimPage {
    purchases {
      id
      source
      shipmentId
      woodType
      grade
      volumeM3
      quantity
      unitPrice
      currency
      exchangeRate
      totalCostUzs
      date
    }
    shipments {
      id
      truckNumber
      truckColor
    }
  }
`;

export const LATEST_RATE = gql`
  query LatestRate {
    latestExchangeRate {
      rubToUzs
      usdToUzs
      date
    }
  }
`;

export const CREATE_PURCHASE = gql`
  mutation CreatePurchase($input: CreatePurchaseInput!) {
    createPurchase(input: $input) {
      id
      totalCostUzs
      volumeM3
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
      quantityRemaining
      unitCostUzsPerM3
    }
    customers {
      id
      name
      debtUzs
    }
  }
`;
