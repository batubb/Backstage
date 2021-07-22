export default function isInfluencer(user) {
  return user && user.type === 'influencer' && user.appStoreProductId;
}
