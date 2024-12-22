/** @format */

import { using } from "./ModClasses.js";

using("Terraria");
using("Terraria.ID");
using("Microsoft.Xna.Framework");
using("Microsoft.Xna.Framework.Graphics");
using("Terraria.GameContent");
using("Terraria.Graphics.Renderers");
using("Terraria.DataStructures");

function drawTexture(
	texture,
	position,
	color,
	rotation,
	origin,
	scale,
	sprite = null
) {
	Main.spriteBatch[
		"void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)"
	](texture, position, null, color, rotation, origin, scale, sprite, 0.0);
}

const vector = (x, y) => {
	return Vector2.new()["void .ctor(float x, float y)"](x, y);
};

function getOrigin(width, height) {
	return vector(width / 2, height / 2);
}

function getPos(x, y) {
	return vector(x - Main.screenPosition.X, y - Main.screenPosition.Y);
}

class WeaponOutLite {
	static IS_MEDIUM = item => {
		return (
			item.axe > 0 ||
			(item.pick > 0 && !WeaponOutLite.IS_DRILL(item)) ||
			item.hammer > 0 ||
			WeaponOutLite.IS_WHIP(item)
		);
	};

	static IS_YOYO = item => {
		return ItemID.Sets.Yoyo[item.type];
	};

	static IS_WHIP = item => {
		return item.summon && item.mana === 0;
	};
	static IS_LARGE = item => {
		return item.melee && !item.channel;
	};

	static IS_DRILL = item => {
		return item.pick > 0 && item.shoot > 0;
	};

	/**
	 * @enum {number}
	 */
	static ItemTypeOffSet = {
		Large: 0,
		Medium: 1
	};

	/**
	 * @param {Vector2} DrawPosition - Get the Player Position to Draw.
	 * @param {GetDrawItemType} itemType- Returns ItemTypeOffSet
	 * @returns {Vector2} Get Position of itemType
	 */
	static GetPositionDrawItem(player, DrawPosition, itemType) {
		switch (itemType) {
			case WeaponOutLite.ItemTypeOffSet.Large:
				return getPos(DrawPosition.X, DrawPosition.Y);

			case WeaponOutLite.ItemTypeOffSet.Medium:
				return getPos(DrawPosition.X, DrawPosition.Y + 6);

			default:
				return getPos(DrawPosition.X, DrawPosition.Y);
		}
	}

	/**
	 * @param {Player} player - get Player class to acess propreties
	 * @param {GetDrawItemType} itemType - Returns ItemTypeOffSet
	 * @returns {SpriteEffects} SpriteEffects modify of your ItemTypeOffSet
	 */
	static GetSpriteDirectionDrawItem(player, itemType) {
		switch (itemType) {
			case WeaponOutLite.ItemTypeOffSet.Large:
				return player.direction !== 1
					? SpriteEffects.None
					: SpriteEffects.FlipHorizontally;

			case WeaponOutLite.ItemTypeOffSet.Medium:
				return player.direction !== 1
					? SpriteEffects.FlipHorizontally
					: SpriteEffects.None;
		}
	}

	/**
	 * @param {Player} player -  get Player class to acess propreties
	 * @param {Item} item - verify propreties to return a scale
	 * @returns {float} - scale modify of your ItemTypeOffSet
	 */
	static GetScaleDrawItem(player, item) {
		let scale = 1;
		if (WeaponOutLite.IS_MEDIUM(item)) scale * 0.9;
		return scale;
	}

	/**
	 * @param {Player} player - get Player class to acess propreties
	 * @param {GetDrawItemType} player - returns ItemTypeOffSet
	 * @returns {Number} - Draw rotation
	 */
	static GetRotationDrawItem(player, itemType) {
		switch (itemType) {
			case WeaponOutLite.ItemTypeOffSet.Large:
				return player.direction === 1 ? -Math.PI / 2 : Math.PI / 2;

			case WeaponOutLite.ItemTypeOffSet.Medium:
				return player.direction === 1 ? Math.PI / 2 : -Math.PI / 2;
			default:
				return 0;
		}
	}
	/**
	 * @param {Item} item - verify propreties to return a type
	 * @returns {ItemTypeOffSet}
	 */
	static GetDrawItemType(item) {
		if (WeaponOutLite.IS_MEDIUM(item))
			return WeaponOutLite.ItemTypeOffSet.Medium;
		if (WeaponOutLite.IS_LARGE(item))
			return WeaponOutLite.ItemTypeOffSet.Large;
	}
}

LegacyPlayerRenderer.DrawPlayerFull.hook((orig, self, camera, player) => {
	const ITEM_TEXTURE = TextureAssets.Item[player.HeldItem.type].Value;
	const ITEM_COLOR = Color.White;
	const ITEM_CAN_DRAW =
		WeaponOutLite.IS_MEDIUM(player.HeldItem) ||
		WeaponOutLite.IS_LARGE(player.HeldItem);

	const PLAYER_LIFE = !player.active || !player.dead;
	const ITEM_NOT_IS_USED =
		player.HeldItem.type !== 0 && player.itemAnimation === 0;

	if (PLAYER_LIFE) {
		if (ITEM_CAN_DRAW) {
			if (ITEM_NOT_IS_USED) {
				const itemType = WeaponOutLite.GetDrawItemType(player.HeldItem);
				/**
				 * @todo Draw Metohod
				 */
				function DrawItem() {
					const POSITION = WeaponOutLite.GetPositionDrawItem(
						player,
						player.Center,
						itemType
					);
					const ROTATION = WeaponOutLite.GetRotationDrawItem(
						player,
						itemType
					);
					const SPRITE_DIRECTION =
						WeaponOutLite.GetSpriteDirectionDrawItem(
							player,
							itemType
						);
					const SCALE = WeaponOutLite.GetScaleDrawItem(
						player,
						itemType
					);

					drawTexture(
						ITEM_TEXTURE,
						POSITION,
						ITEM_COLOR,
						ROTATION,
						getOrigin(ITEM_TEXTURE.Width, ITEM_TEXTURE.Height),
						SCALE,
						SPRITE_DIRECTION
					);
				}
				DrawItem();
			}
		}
	}

	orig(self, camera, player);
});
