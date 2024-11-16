/*
  Warnings:

  - You are about to drop the column `body` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `converationId` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `seen` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `conversationsIds` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `_ConversationToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `converations` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `message` to the `messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recieverId` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_ConversationToUser" DROP CONSTRAINT "_ConversationToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_ConversationToUser" DROP CONSTRAINT "_ConversationToUser_B_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_converationId_fkey";

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "body",
DROP COLUMN "converationId",
DROP COLUMN "seen",
ADD COLUMN     "message" TEXT NOT NULL,
ADD COLUMN     "messageStatus" TEXT NOT NULL DEFAULT 'sent',
ADD COLUMN     "recieverId" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'text';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "conversationsIds";

-- DropTable
DROP TABLE "_ConversationToUser";

-- DropTable
DROP TABLE "converations";

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_recieverId_fkey" FOREIGN KEY ("recieverId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
