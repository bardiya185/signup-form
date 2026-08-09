import { db } from '../db';
import { toWalletTransactionDto } from '../resources';
import type * as D from '@/types/domain';

export function walletOverview(user: D.User) {
  const wallet = db.wallets.find((w) => w.user_id === user.id);
  const transactions = wallet
    ? db.wallet_transactions.filter((t) => t.wallet_id === wallet.id)
    : [];
  const deposits = transactions.filter((t) => t.type === 'deposit').reduce((s, t) => s + t.amount, 0);
  const withdraws = transactions.filter((t) => t.type === 'withdraw').reduce((s, t) => s + t.amount, 0);
  return {
    balance: wallet?.balance ?? 0,
    totalDeposits: deposits,
    totalWithdraws: withdraws,
    transactionsCount: transactions.length,
  };
}

export function walletTransactions(user: D.User, page: number, perPage: number) {
  const wallet = db.wallets.find((w) => w.user_id === user.id);
  const list = wallet
    ? db.wallet_transactions
        .filter((t) => t.wallet_id === wallet.id)
        .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    : [];
  return { items: list.slice((page - 1) * perPage, page * perPage).map(toWalletTransactionDto), total: list.length };
}
