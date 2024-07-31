import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";

export const get = internalQuery({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orgSubscription")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .unique();
  },
});

export const getIsSubscribed = query({
  args: { orgId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.orgId) return false;

    const orgSubscription = await ctx.db
      .query("orgSubscription")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId as string))
      .unique();

    const periodEnd = orgSubscription?.stripeCurrentPeriodEnd;
    const isSubscribed = periodEnd && periodEnd > Date.now();

    return isSubscribed;
  },
});

export const create = internalMutation({
  args: {
    orgId: v.string(),
    stripePriceId: v.string(),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    stripeCurrentPeriodEnd: v.number(),
  },
  handler: async (ctx, args) => {
    const {
      orgId,
      stripePriceId,
      stripeCustomerId,
      stripeCurrentPeriodEnd,
      stripeSubscriptionId,
    } = args;
    const orgSubscription = await ctx.db.insert("orgSubscription", {
      orgId,
      stripeCustomerId,
      stripeSubscriptionId,
      stripePriceId,
      stripeCurrentPeriodEnd,
    });

    return orgSubscription;
  },
});

export const update = internalMutation({
  args: {
    stripeSubscriptionId: v.string(),
    stripeCurrentPeriodEnd: v.number(),
  },
  handler: async (ctx, args) => {
    const { stripeSubscriptionId, stripeCurrentPeriodEnd } = args;
    try {
      const existingSubscription = await ctx.db
        .query("orgSubscription")
        .withIndex("by_subscription_id", (q) =>
          q.eq("stripeSubscriptionId", stripeSubscriptionId)
        )
        .unique();

      if (!existingSubscription) {
        throw new Error("Subscription not found");
      }

      await ctx.db.patch(existingSubscription._id, {
        stripeCurrentPeriodEnd,
      });

      return { success: true };
    } catch (error) {
      console.error("Error updating org subscription:", error);
      return { success: false };
    }
  },
});
