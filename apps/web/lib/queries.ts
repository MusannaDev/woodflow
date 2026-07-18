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
