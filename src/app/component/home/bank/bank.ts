export class BankForm {
    bank_name: string = '';
    branch_name: string = '';
}

export class BankItem {
    no: number;
    bank_id: string;
    bank_name: string;
    branches: any[];
    create_by: string;
    update_by: string;
}