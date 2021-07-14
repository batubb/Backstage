export default function isInfluencer(user) {
  return !!(
    user.type === 'influencer' && typeof user.appStoreProductId !== 'undefined'
  );
}
